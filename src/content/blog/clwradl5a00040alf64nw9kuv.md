---
author: ProDevOpsGuy Team
pubDatetime: 2024-05-29T03:48:17Z
title: The Ultimate CICD Corporate DevOps Pipeline Project
slug: the-ultimate-cicd-corporate-devops-pipeline-project
ogImage: https://cdn.hashnode.com/res/hashnode/image/upload/v1716954161102/44c6fbaa-4e49-4f61-b4f7-2898e3006d6c.png
featured: true
draft: false
tags:
  - aws
  - jenkins
  - devops
  - github
  - ci-cd
  - nexus
description: DevOps Project - The Ultimate CICD Corporate DevOps Pipeline Project
---

![alt text](https://cdn.hashnode.com/res/hashnode/image/upload/v1716954161102/44c6fbaa-4e49-4f61-b4f7-2898e3006d6c.png)

## Table of contents

# ULTIMATE CICD PIPELINE PROJECT 🚀

## PHASE 1: INFRASTRUCTURE SETUP 🛠️

### 1\. Creating 3 Ubuntu 24.04 VM Instances on AWS 🌐

1. **Sign in to the AWS Management Console:**

   - Go to [AWS Management Console](https://aws.amazon.com/console/).

   - Sign in with your AWS account credentials.

2. **Navigate to EC2:**

   - Type "EC2" in the search bar or select "Services" &gt; "EC2" under the "Compute" section.

3. **Launch Instance:**

   - Click "Instances" in the EC2 dashboard sidebar.

   - Click the "Launch Instance" button.

4. **Choose an Amazon Machine Image (AMI):**

   - Select "Ubuntu" from the list of available AMIs.

   - Choose "Ubuntu Server 24.04 LTS".

   - Click "Select".

5. **Choose an Instance Type:**

   - Select an instance type (e.g., t2.micro for testing).

   - Click "Next: Configure Instance Details".

6. **Configure Instance Details:**

   - Configure optional settings or leave them as default.

   - Click "Next: Add Storage".

7. **Add Storage:**

   - Specify the root volume size (default is usually fine).

   - Click "Next: Add Tags".

8. **Add Tags:**

   - Optionally, add tags for better organization.

   - Click "Next: Configure Security Group".

9. **Configure Security Group:**

   - Allow SSH access (port 22) from your IP address.

   - Optionally, allow other ports (e.g., HTTP port 80, HTTPS port 443).

   - Click "Review and Launch".

10. **Review and Launch:**

    - Review the instance configuration.

    - Click "Launch".

11. **Select Key Pair:**

    - Select an existing key pair or create a new one.

    - Check the acknowledgment box.

    - Click "Launch Instances".

12. **Access Your Instance:**

    - Use an SSH client like MobaXterm:

      - Open MobaXterm and click "Session" &gt; "SSH".

      - Enter the public IP address of your instance.

      - Select "Specify username" and enter "ubuntu".

      - Under "Advanced SSH settings", select "Use private key" and browse to your key pair file (.pem).

      - Click "OK" to connect.

### 2\. Install Docker on All 3 VMs 🐳

**Step-by-Step Installation:**

1. **Install prerequisite packages:**

   ```sh
   sudo apt-get update
   sudo apt-get install ca-certificates curl
   ```

2. **Download and add Docker's official GPG key:**

   ```sh
   sudo install -m 0755 -d /etc/apt/keyrings
   sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
   sudo chmod a+r /etc/apt/keyrings/docker.asc
   ```

3. **Add Docker repository to Apt sources:**

   ```sh
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   ```

4. **Update package index:**

   ```sh
   sudo apt-get update
   ```

5. **Install Docker packages:**

   ```sh
   sudo apt-get install docker-ce docker-ce-cli containerd.io -y
   ```

6. **Grant permission to Docker socket (optional, for convenience):**

   ```sh
   sudo chmod 666 /var/run/docker.sock
   ```

By following these steps, you should have successfully installed Docker on your Ubuntu system. You can now start using Docker to containerize and manage your applications.

---

## Setting Up Jenkins on Ubuntu 🔧

**Step-by-Step Installation:**

1. **Update the system:**

   ```sh
   sudo apt-get update
   sudo apt-get upgrade -y
   ```

2. **Install Java (Jenkins requires Java):**

   ```sh
   sudo apt install -y fontconfig openjdk-17-jre
   ```

3. **Add Jenkins repository key:**

   ```sh
   sudo wget -O /usr/share/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
   ```

4. **Add Jenkins repository:**

   ```sh
   echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
   ```

5. **Update the package index:**

   ```sh
   sudo apt-get update
   ```

6. **Install Jenkins:**

   ```sh
   sudo apt-get install -y jenkins
   ```

7. **Start and enable Jenkins:**

   ```sh
   sudo systemctl start jenkins
   sudo systemctl enable jenkins
   ```

8. **Access Jenkins:**

   - Open a web browser and go to [http://your_server_ip_or_domain:8080](http://your_server_ip_or_domain:8080).

   - You will see a page asking for the initial admin password. Retrieve it using:

     ```sh
     sudo cat /var/lib/jenkins/secrets/initialAdminPassword
     ```

   - Enter the password, install suggested plugins, and create your first admin user.

---

## Installing Trivy on Jenkins Server 🔍

**Step-by-Step Installation:**

1. **Install prerequisite packages:**

   ```sh
   sudo apt-get install wget apt-transport-https gnupg lsb-release
   ```

2. **Add Trivy repository key:**

   ```sh
   wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
   ```

3. **Add Trivy repository to sources:**

   ```sh
   echo deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main | sudo tee -a /etc/apt/sources.list.d/trivy.list
   ```

4. **Update package index:**

   ```sh
   sudo apt-get update
   ```

5. **Install Trivy:**

   ```sh
   sudo apt-get install trivy
   ```

---

## Setting Up Nexus Repository Manager Using Docker 📦

**Step-by-Step Installation:**

1. **Pull the Nexus Docker image:**

   ```sh
   sudo docker pull sonatype/nexus3
   ```

2. **Run the Nexus container:**

   ```sh
   sudo docker run -d -p 8081:8081 --name nexus -v nexus-data:/nexus-data sonatype/nexus3
   ```

3. **Access Nexus:**

   - Open a web browser and go to [http://your_server_ip_or_domain:8081](http://your_server_ip_or_domain:8081).

   - The default username is `admin`. Retrieve the initial admin password from the log:

     ```sh
     sudo docker logs nexus 2>&1 | grep -i password
     ```

   - Complete the setup wizard.

---

## Setting Up SonarQube Using Docker 📈

**Step-by-Step Installation:**

1. **Create a network for SonarQube and PostgreSQL:**

   ```sh
   sudo docker network create sonarnet
   ```

2. **Run PostgreSQL container:**

   ```sh
   sudo docker run -d --name sonarqube_db --network sonarnet -e POSTGRES_USER=sonar -e POSTGRES_PASSWORD=sonar -e POSTGRES_DB=sonarqube -v postgresql:/var/lib/postgresql -v postgresql_data:/var/lib/postgresql/data postgres:latest
   ```

3. **Run SonarQube container:**

   ```sh
   sudo docker run -d --name sonarqube --network sonarnet -p 9000:9000 -e sonar.jdbc.url=jdbc:postgresql://sonarqube_db:5432/sonarqube -e sonar.jdbc.username=sonar -e sonar.jdbc.password=sonar -v sonarqube_data:/opt/sonarqube/data -v sonarqube_extensions:/opt/sonarqube/extensions -v sonarqube_logs:/opt/sonarqube/logs sonarqube:latest
   ```

4. **Access SonarQube:**

   - Open a web browser and go to [http://your_server_ip_or_domain:9000](http://your_server_ip_or_domain:9000).

   - The default username and password are both `admin`.

---

## PHASE 2: SOURCE CODE SETUP 📝

**Project Repo:** [HERE](https://github.com/jaiswaladi246/Mission.git)

### Creating a Private Repository on GitHub and Pushing Source Code Using Git Bash 🌟

**Part 1: Create a Private Repository on GitHub**

1. **Sign in to GitHub:**

   - Go to [GitHub](https://github.com/).

   - Sign in with your GitHub account credentials.

2. **Create a New Repository:**

   - Click the "+" icon in the top-right corner and select "New repository".

   - Name your repository (e.g., `my-private-repo`).

   - Set the repository to "Private".

   - Optionally, add a description.

   - Click "Create repository".

**Part 2: Push Source Code Using Git Bash**

1. **Clone the existing repository:**

   ```sh
   git clone https://github.com/jaiswaladi246/Mission.git
   cd Mission
   ```

2. **Add the private repository as a remote:**

   ```sh
   git remote add private-repo https://github.com/your-username/my-private-repo.git
   ```

3. **Push the code to the private repository:**

   ```sh
   git push private-repo main
   ```

---

## Automating Docker Builds and Pushes in Jenkins Pipeline ⚙️

**Pipeline Script for Jenkinsfile:**

```go
pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/jaiswaladi246/Mission.git'
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build("my-image:${env.BUILD_ID}")
                }
            }
        }
        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials-id') {
                        dockerImage.push("${env.BUILD_ID}")
                    }
                }
            }
        }
    }
}
```

**Step-by-Step Guide:**

1. **Access Jenkins:**

   - Go to [http://your_server_ip_or_domain:8080](http://your_server_ip_or_domain:8080).

2. **Create a New Pipeline Job:**

   - Click "New Item".

   - Enter a name (e.g., `Docker-Pipeline`).

   - Select "Pipeline" and click "OK".

3. **Configure the Pipeline:**

   - Under "Pipeline", select "Pipeline script".

   - Copy and paste the provided Jenkinsfile script.

   - Click "Save".

4. **Run the Pipeline:**

   - Click "Build Now" to start the pipeline.

---

**That's it!** You have now set up a complete CI/CD pipeline with Docker, Jenkins, Trivy, Nexus, and SonarQube on Ubuntu VMs. Congratulations on your progress and happy DevOps journey! 🚀

If you find this article helpful then you can [**buy me a coffee**](https://www.buymeacoffee.com/harshhaareddy)**.**

### Follow for more stories like this 😊/ [**GitHub**](https://github.com/NotHarshhaa) / [**Hashnode**](https://hashnode.com/@prodevopsguy)
