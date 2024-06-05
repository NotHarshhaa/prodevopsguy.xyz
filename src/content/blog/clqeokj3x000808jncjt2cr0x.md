---
author: ProDevOpsGuy Team
pubDatetime: 2024-06-03T04:06:21Z
title: Zomato Clone - Secure Deployment with DevSecOps CI/CD
slug: zomato-clone-secure-deployment-with-devsecops-cicd
ogImage: https://cdn.hashnode.com/res/hashnode/image/upload/v1703130382144/3e119a63-2687-4fe2-b1c3-053774166e15.png
featured: true
draft: false
tags:
  - devsecops
  - github
  - devops
  - deployment
  - ci-cd
description: Get ready for an exciting journey as we embark on deploying a React JS Zomato clone. Our trusty companion on this adventure is Jenkins, serving as our CI/CD tool, while the magic happens inside a Docker container. Dive into the details in this comprehensive blog — your go-to guide for the entire process.
---

![alt text](https://cdn.hashnode.com/res/hashnode/image/upload/v1703130382144/3e119a63-2687-4fe2-b1c3-053774166e15.png)

Hey there! Get ready for an exciting journey as we embark on deploying a React JS Zomato clone. Our trusty companion on this adventure is Jenkins, serving as our CI/CD tool, while the magic happens inside a Docker container. Dive into the details in this comprehensive blog — your go-to guide for the entire process.

### _🚀_ **_Explore the GitHub Repository_** [**_https://github.com/NotHarshhaa/Zomato-Clone.git_**](https://github.com/NotHarshhaa/Zomato-Clone.git) **_for all the code and resources. Happy coding, friends!_**

![](https://miro.medium.com/v2/resize:fit:736/0*1eRpoAmlI9myi-Fi)

# **Steps:-**

**Step 1** — Launch an Ubuntu(22.04) T2 Large Instance

**Step 2** — Install Jenkins, Docker and Trivy. Create a Sonarqube Container using Docker.

**Step 3** — Install Plugins like JDK, Sonarqube Scanner, Nodejs, and OWASP Dependency Check.

**Step 4** — Create a Pipeline Project in Jenkins using a Declarative Pipeline

**Step 5** — Install OWASP Dependency Check Plugins

**Step 6** — Docker Image Build and Push

**Step 7** — Deploy the image using Docker

**Step 8** — Terminate the AWS EC2 Instances.

Now, let’s get started and dig deeper into each of these steps:-

## **Step 1:Launch an Ubuntu(22.04) T2 Large Instance**

Launch an AWS T2 Large Instance. Use the image as Ubuntu. You can create a new key pair or use an existing one. Enable HTTP and HTTPS settings in the Security Group and open all ports (not best case to open all ports but just for learning purposes it’s okay).

![](https://miro.medium.com/v2/resize:fit:736/1*7B50QPeIbJ-EbQh7E-wOdQ.png)

## **Step 2 — Install Jenkins, Docker and Trivy**

### **2A — To Install Jenkins**

Connect to your console, and enter these commands to Install Jenkins

```yaml
vim jenkins.sh
```

**COPY**

```yaml
#!/bin/bash
sudo apt update -y
#sudo apt upgrade -y
wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public | tee /etc/apt/keyrings/adoptium.asc
echo "deb [signed-by=/etc/apt/keyrings/adoptium.asc] https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | tee /etc/apt/sources.list.d/adoptium.list
sudo apt update -y
sudo apt install temurin-17-jdk -y
/usr/bin/java --version
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
                  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
                  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
                              /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update -y
sudo apt-get install jenkins -y
sudo systemctl start jenkins
sudo systemctl status jenkins
```

```yaml
sudo chmod 777 jenkins.sh
./jenkins.sh # this will installl jenkins
```

Once Jenkins is installed, you will need to go to your AWS EC2 Security Group and open Inbound Port 8080, since Jenkins works on Port 8080.

Now, grab your Public IP Address

```yaml
<EC2 Public IP Address:8080>
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

![](https://miro.medium.com/v2/resize:fit:736/1*EpiSV85C0SEvChz5zm4rIw.png)

Unlock Jenkins using an administrative password and install the suggested plugins.

![](https://miro.medium.com/v2/resize:fit:736/1*oFUO_Cga52FT8bscLry3_Q.png)

Jenkins will now get installed and install all the libraries.

![](https://miro.medium.com/v2/resize:fit:736/1*L0XlriJskwbydfaJHRcbCw.png)

Create a user click on save and continue.

Jenkins Getting Started Screen.

![](https://miro.medium.com/v2/resize:fit:736/1*OpoGxd6FwcZeZWZKBHdlfQ.png)

## **2B — Install Docker**

```yaml
sudo apt-get update
sudo apt-get install docker.io -y
sudo usermod -aG docker $USER   #my case is ubuntu
newgrp docker
sudo chmod 777 /var/run/docker.sock
```

After the docker installation, we create a sonarqube container (Remember to add 9000 ports in the security group).

```yaml
docker run -d --name sonar -p 9000:9000 sonarqube:lts-community
```

![](https://miro.medium.com/v2/resize:fit:736/1*gHXat-rdGvFXGYASgPQblw.png)

Now our sonarqube is up and running

![](https://miro.medium.com/v2/resize:fit:736/1*1nZijc9tTcLWN9-SieDGiw.png)

Enter username and password, click on login and change password

```yaml
username admin
password admin
```

![](https://miro.medium.com/v2/resize:fit:736/1*fzoWe4G78pLSt3I-tiFJXA.png)

Update New password, This is Sonar Dashboard.

![](https://miro.medium.com/v2/resize:fit:736/1*6b0ljtihR81StlDV3a3d_Q.png)

### **2C — Install Trivy**

```yaml
vim trivy.sh
```

```yaml
sudo apt-get install wget apt-transport-https gnupg lsb-release -y
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy -y
```

Next, we will log in to Jenkins and start to configure our Pipeline in Jenkins

## **Step 3 — Install Plugins like JDK, Sonarqube Scanner, NodeJs, OWASP Dependency Check**

### **3A — Install Plugin**

Goto Manage Jenkins →Plugins → Available Plugins →

Install below plugins

1 → Eclipse Temurin Installer (Install without restart)

2 → SonarQube Scanner (Install without restart)

3 → NodeJs Plugin (Install Without restart)

![](https://miro.medium.com/v2/resize:fit:736/1*OQlTC716djHfaS3AwDOfdA.png)

### **3B — Configure Java and Nodejs in Global Tool Configuration**

Goto Manage Jenkins → Tools → Install JDK(17) and NodeJs(16)→ Click on Apply and Save

![](https://miro.medium.com/v2/resize:fit:736/0*10Em5E8wbKDktlsi)

![](https://miro.medium.com/v2/resize:fit:736/0*j8RTB62Wsc8dohij)

### **3C — Create a Job**

Create a job as Zomato Name, select pipeline and click on ok.

![](https://miro.medium.com/v2/resize:fit:736/1*ZPVBHGzQSPzp-3uwL0ARFQ.png)

## **Step 4 — Configure Sonar Server in Manage Jenkins**

Grab the Public IP Address of your EC2 Instance, Sonarqube works on Port 9000, so &lt;Public IP&gt;:9000. Goto your Sonarqube Server. Click on Administration → Security → Users → Click on Tokens and Update Token → Give it a name → and click on Generate Token

![](https://miro.medium.com/v2/resize:fit:736/1*Ziil8QHxn94AdCIsauURrg.png)

click on update Token

![](https://miro.medium.com/v2/resize:fit:736/1*IgOyVcZ9nPjXNNGOpneISw.png)

Create a token with a name and generate

![](https://miro.medium.com/v2/resize:fit:736/1*uAkoy85MXN3dTWbn5Gkjuw.png)

copy Token

Goto Jenkins Dashboard → Manage Jenkins → Credentials → Add Secret Text. It should look like this

![](https://miro.medium.com/v2/resize:fit:736/1*E-ccRm-XBqKSTUZm225hoA.png)

You will this page once you click on create

![](https://miro.medium.com/v2/resize:fit:736/1*4i_R7hLnBay1HgrMEkkHMA.png)

Now, go to Dashboard → Manage Jenkins → System and Add like the below image.

![](https://miro.medium.com/v2/resize:fit:736/1*L-jn869O3XQ3UQcA9dKcSQ.png)

Click on Apply and Save

The Configure System option is used in Jenkins to configure different server

Global Tool Configuration is used to configure different tools that we install using Plugins

We will install a sonar scanner in the tools.

![](https://miro.medium.com/v2/resize:fit:736/1*HE_NnYldri714mObLqKxcQ.png)

In the Sonarqube Dashboard add a quality gate also

Administration → Configuration →Webhooks

![](https://miro.medium.com/v2/resize:fit:736/1*lYImJVM_K4c3xBTrT9YzHA.png)

Click on Create

![](https://miro.medium.com/v2/resize:fit:736/1*Xq0O7dtRS6moajyVdZ2OJA.png)

Add details

```yaml
#in url section of quality gate
<http://jenkins-public-ip:8080>/sonarqube-webhook/
```

![](https://miro.medium.com/v2/resize:fit:736/1*NWbqEH2whidmGvvIrEuTyQ.png)

Let’s go to our Pipeline and add the script in our Pipeline Script.

```yaml
pipeline{
    agent any
    tools{
        jdk 'jdk17'
        nodejs 'node16'
    }
    environment {
        SCANNER_HOME=tool 'sonar-scanner'
    }
    stages {
        stage('clean workspace'){
            steps{
                cleanWs()
            }
        }
        stage('Checkout from Git'){
            steps{
                git branch: 'main', url: 'https://github.com/NotHarshhaa/Zomato-Clone.git'
            }
        }
        stage("Sonarqube Analysis "){
            steps{
                withSonarQubeEnv('sonar-server') {
                    sh ''' $SCANNER_HOME/bin/sonar-scanner -Dsonar.projectName=zomato \
                    -Dsonar.projectKey=zomato '''
                }
            }
        }
        stage("quality gate"){
           steps {
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'Sonar-token'
                }
            }
        }
        stage('Install Dependencies') {
            steps {
                sh "npm install"
            }
        }
    }
}
```

Click on Build now, you will see the stage view like this

![](https://miro.medium.com/v2/resize:fit:736/1*zPT6BjUUCT_xG3APTmsSLw.png)

To see the report, you can go to Sonarqube Server and go to Projects.

![](https://miro.medium.com/v2/resize:fit:736/1*S8U7wDGjPYc03j6fGMk0-Q.png)

You can see the report has been generated and the status shows as passed. You can see that there are 1.3k lines. To see a detailed report, you can go to issues.

## **Step 5 — Install OWASP Dependency Check Plugins**

GotoDashboard → Manage Jenkins → Plugins → OWASP Dependency-Check. Click on it and install it without restart.

![](https://miro.medium.com/v2/resize:fit:736/0*__DIwTQt2lKkBjZw)

First, we configured the Plugin and next, we had to configure the Tool

Goto Dashboard → Manage Jenkins → Tools →

![](https://miro.medium.com/v2/resize:fit:736/0*S-8iOHM8dxX4UdzH)

Click on Apply and Save here.

Now go configure → Pipeline and add this stage to your pipeline and build.

```yaml

        stage('OWASP FS SCAN') {
            steps {
                dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit', odcInstallation: 'DP-Check'
                dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
            }
        }
        stage('TRIVY FS SCAN') {
            steps {
                sh "trivy fs . > trivyfs.txt"
            }
        }
```

The stage view would look like this,

![](https://miro.medium.com/v2/resize:fit:736/1*ASvOScJgoezWNQBDiulONQ.png)

You will see that in status, a graph will also be generated and Vulnerabilities.

![](https://miro.medium.com/v2/resize:fit:736/1*HKjI3tzLa_D4NLob4nr0mw.png)

## **Step 6 — Docker Image Build and Push**

We need to install the Docker tool in our system, Goto Dashboard → Manage Plugins → Available plugins → Search for Docker and install these plugins

`Docker`

`Docker Commons`

`Docker Pipeline`

`Docker API`

`docker-build-step`

and click on install without restart

![](https://miro.medium.com/v2/resize:fit:736/1*UsvgAsc9otnvq0bhuPOYvw.png)

Now, goto Dashboard → Manage Jenkins → Tools →

![](https://miro.medium.com/v2/resize:fit:736/0*HV8K4gucEj8IlxDq)

Add DockerHub Username and Password under Global Credentials

![](https://miro.medium.com/v2/resize:fit:736/1*E5hpiNnA-12GoyekvleE_w.png)

![](https://miro.medium.com/v2/resize:fit:736/1*HEPegYR7CXryKabm0eLR0g.png)

Add this stage to Pipeline Script

```yaml

        stage("Docker Build & Push"){
            steps{
                script{
                   withDockerRegistry(credentialsId: 'docker', toolName: 'docker'){
                       sh "docker build -t zomato ."
                       sh "docker tag zomato NotHarshhaa/zomato:latest "
                       sh "docker push NotHarshhaa/zomato:latest "
                    }
                }
            }
        }
        stage("TRIVY"){
            steps{
                sh "trivy image NotHarshhaa/zomato:latest > trivy.txt"
            }
        }
```

You will see the output below, with a dependency trend.

![](https://miro.medium.com/v2/resize:fit:736/1*Si-o7RWLHlDrYWi8S87HTQ.png)

When you log in to Dockerhub, you will see a new image is created

Now Run the container to see if the app coming up or not by adding the below stage

```yaml
stage('Deploy to container'){
steps{
sh 'docker run -d --name zomato -p 3000:3000 NotHarshhaa/zomato:latest'
}
}
```

stage view

![](https://miro.medium.com/v2/resize:fit:736/1*w_f-xmTkU_DMDJmc_IzDTw.png)

`<Jenkins-public-ip:3000>`

You will get this output

![](https://miro.medium.com/v2/resize:fit:736/1*xVxk3tSbk9yA6hel60t13g.png)

![](https://miro.medium.com/v2/resize:fit:736/1*KOwp6K2sOcSmDyk9Axnvhw.png)

![](https://miro.medium.com/v2/resize:fit:736/1*t1x_F_qwHI6anvRHS59OxA.png)

## **Step 8: Terminate instances.**

Efficiently manage resources by terminating the AWS EC2 Instances to ensure cost-effectiveness and environmental responsibility, completing the deployment lifecycle. Utilize AWS management tools or commands to gracefully shut down and terminate the Ubuntu(22.04) T2 Large Instance, concluding the deployment process while maintaining operational efficiency.

### **Complete Pipeline**

```go
pipeline{
    agent any
    tools{
        jdk 'jdk17'
        nodejs 'node16'
    }
    environment {
        SCANNER_HOME=tool 'sonar-scanner'
    }
    stages {
        stage('clean workspace'){
            steps{
                cleanWs()
            }
        }
        stage('Checkout from Git'){
            steps{
                git branch: 'main', url: 'https://github.com/NotHarshhaa/Zomato-Clone.git'
            }
        }
        stage("Sonarqube Analysis "){
            steps{
                withSonarQubeEnv('sonar-server') {
                    sh ''' $SCANNER_HOME/bin/sonar-scanner -Dsonar.projectName=zomato \
                    -Dsonar.projectKey=zomato '''
                }
            }
        }
        stage("quality gate"){
           steps {
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'Sonar-token'
                }
            }
        }
        stage('Install Dependencies') {
            steps {
                sh "npm install"
            }
        }
        stage('OWASP FS SCAN') {
            steps {
                dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit', odcInstallation: 'DP-Check'
                dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
            }
        }
        stage('TRIVY FS SCAN') {
            steps {
                sh "trivy fs . > trivyfs.txt"
            }
        }
        stage("Docker Build & Push"){
            steps{
                script{
                   withDockerRegistry(credentialsId: 'docker', toolName: 'docker'){
                       sh "docker build -t zomato ."
                       sh "docker tag zomato NotHarshhaa/zomato:latest "
                       sh "docker push NotHarshhaa/zomato:latest "
                    }
                }
            }
        }
        stage("TRIVY"){
            steps{
                sh "trivy image NotHarshhaa/zomato:latest > trivy.txt"
            }
        }
        stage('Deploy to container'){
            steps{
                sh 'docker run -d --name zomato -p 3000:3000 NotHarshhaa/zomato:latest'
            }
        }
    }
}
```

_In conclusion, this comprehensive guide has walked you through the essential steps to set up a robust and efficient CI/CD pipeline on an Ubuntu 22.04 T2 Large Instance using Jenkins, Docker, and Trivy. From the initial launch of the AWS EC2 instance to the installation of critical tools such as Jenkins, Docker, and Trivy, as well as the creation of a Sonarqube container, each step has been meticulously covered._

_The integration of essential plugins like JDK, Sonarqube Scanner, Nodejs, and OWASP Dependency Check further enhances the pipeline’s capabilities. The creation of a Declarative Pipeline in Jenkins streamlines the development process, and the incorporation of OWASP Dependency Check Plugins fortifies security measures._

_The guide concludes with the crucial steps of Docker image build, push, deployment, and, ultimately, the termination of AWS EC2 instances, ensuring a seamless and controlled workflow. By following these steps, you’ve not only established a powerful CI/CD pipeline but also prioritized security and efficiency throughout the entire development lifecycle._

## Author by:

![](https://imgur.com/2j6Aoyl.png)

> Join Our [Telegram Community](https:t.me/prodevopsguy) || [Follow me](https://github.com/NotHarshhaa) for more DevOps Content
