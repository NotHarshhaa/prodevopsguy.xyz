---
author: ProDevOpsGuy Team
pubDatetime: 2024-03-28T16:49:36Z
title: DevSecOps - GitLab CI/CD Amazon App Deployment on AWS EKS
slug: devsecops-gitlab-cicd-amazon-app-deployment-on-aws-eks
featured: false
draft: false
tags:
  - aws
  - gitlab
  - devsecops
  - devops
  - ci-cd
description: DevOps Project - DevSecOps GitLab CI/CD Amazon App Deployment on AWS EKS
---

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1711642217676/b0d73656-ebd6-408d-a00c-7807de8af5df.png)

## Table of contents

# **Introduction:**

In today’s fast-paced world of **software development**, the integration of security into every stage of the development lifecycle is no longer a luxury — it’s a necessity. **DevSecOps** practices have emerged as a solution to seamlessly weave security into the fabric of **DevOps processes**, ensuring that applications are not only developed and deployed rapidly but are also fortified against ever-evolving threats.

In this blog post, we’ll embark on a journey that combines the power of **GitLab CI/CD**, **Amazon EKS (Elastic Kubernetes Service)**, and an arsenal of cutting-edge security tools to deploy our application securely on **AWS infrastructure**. Leveraging the robust capabilities of **GitLab CI/CD**, we’ll automate our pipeline, from code commits to production deployment, while simultaneously integrating comprehensive security checks at each step.

But our commitment to security doesn’t stop there. We’ll employ **Trivy to scan our Docker images and files for vulnerabilities**, ensuring that only the most secure artifacts make their way into our deployments. Additionally, we’ll harness the analytical prowess of **SonarQube** to conduct in-depth code analysis, guaranteeing that our application’s codebase adheres to the highest standards of quality and security.

Join us as we dive deep into the world of **DevSecOps**, where speed and security converge harmoniously to deliver robust and resilient applications in the cloud. Let’s embark on this journey together, embracing the ethos of **DevSecOps** to build a safer digital future.

**Prerequisites:**

1. GitLab Account.
2. AWS Account.
3. Create a Dynamo table with name “Lock-Files”
4. Create an S3 bucket.
5. An IAM User Access Keys.
6. A AWS Key Pair.
7. Terraform and AWS CLI installed.

## **STEPS:**

### **STEP 1 :- Create an EC2 Server.**

1. Clone the GitLab Repository.

GitLab Repo: [https://gitlab.com/project_devops3/Amazon_Clone.git](https://gitlab.com/project_devops3/Amazon_Clone.git)

```bash
git clone https://gitlab.com/project_devops3/Amazon_Clone.git
```

2\. Navigate to GitLab-Server-TF

3\. Do some modifications to the backend.tf file such as changing the **bucket** name and **DynamoDB** table with created ones.

4\. Now, you have to replace the Pem File name with one already created on AWS in variables.tfvars.

5\. Initialize the backend by running the below command.

```bash
terraform init
```

![](https://miro.medium.com/v2/resize:fit:736/1*-eWIHOzOhodnOvJbHkHRCA.png)

6\. Run the below command to get the blueprint of what kind of AWS services will be created.

```bash
terraform plan -var-file=variables.tfvars
```

![](https://miro.medium.com/v2/resize:fit:736/1*d0XbdOS3o6RnJ4DAGqf5FQ.png)

7\. Now, run the below command to create the infrastructure on AWS Cloud which will take 3 to 4 minutes maximum.

```bash
terraform apply -var-file=variables.tfvars --auto-approve
```

![](https://miro.medium.com/v2/resize:fit:736/1*Y1sPPISxM29I5VMiaqR-WQ.png)

8\. Now this will create an EC2 server on AWS.

![](https://miro.medium.com/v2/resize:fit:736/1*WP81yKKru9cYVjkudZTi8A.png)

9\. Now connect to it with created Key-Pair.

![](https://miro.medium.com/v2/resize:fit:736/1*c5ukdSjCMbQYoeBq0SfXYw.png)

### **STEP: 2 :- Configure SonarQube Server.**

1. Access SonarQube on port 9000 of public Ip of EC2 server.
2. Login with “admin” as username and password.

![](https://miro.medium.com/v2/resize:fit:736/1*13FezdGo2EGXDyGrlwDMgg.png)

3\. Update the password.

![](https://miro.medium.com/v2/resize:fit:736/1*Kjsyexkmbvc0KxFVA6YImA.png)

4\. Click on “manually”.

![](https://miro.medium.com/v2/resize:fit:736/1*fOJir7l6aZItp_EM8WJd6g.png)

5\. Provide a name and click on “Set Up”.

![](https://miro.medium.com/v2/resize:fit:736/1*ioM84HwnC7K9cya8DUV1Ww.png)

6\. Select “With GitLab CI”.

![](https://miro.medium.com/v2/resize:fit:736/1*ZReTt8oDS0-53laBxAksmg.png)

7\. Select “Other” under best directories you build.

![](https://miro.medium.com/v2/resize:fit:736/1*ChI_zfskcrgCOkteKfEoOw.png)

8\. Create a repository in Gitlab and get into it.

9 . Create a file with name `sonar-project.properties`and Paste the content that you got from SonarQube.

![](https://miro.medium.com/v2/resize:fit:736/1*Hngwd6DAraEpSK9QDkR4aA.png)

10\. Click on continue in SonarQube.

11\. Click on “Generate Token”.

![](https://miro.medium.com/v2/resize:fit:736/1*ug7b44wqA5GkgOYuImG92g.png)

12\. Generate it.

![](https://miro.medium.com/v2/resize:fit:736/1*Cc5nB-Dr9-c_0PoCUQKDeQ.png)

13\. Now copy them and now go to GitLab Click on settings and CI/CD.

![](https://miro.medium.com/v2/resize:fit:736/1*1BTRSJ8gd428BN8qTBoQeg.png)

14\. Under variables expand and click on “add variable”.

![](https://miro.medium.com/v2/resize:fit:736/1*OsMRL_6cDw6a5gbPRw_J0Q.png)

15\. Add Created token with name “SONAR_TOKEN”.

![](https://miro.medium.com/v2/resize:fit:736/1*HqdrF9bRuOVxzWza5Z1l0A.png)

16\. Similarly copy the name and value of sonar-host.

![](https://miro.medium.com/v2/resize:fit:736/1*hXPVE8NKGb3wkNEjBuEoWA.png)

17\. Add it as another variable with key “SONAR_HOST_URL”.

![](https://miro.medium.com/v2/resize:fit:736/1*KflyKQrI4fCriZ-g9bynfA.png)

18\. Click on Finish this tutorial.

![](https://miro.medium.com/v2/resize:fit:736/1*B_foTY48rTJJs360yFOBLQ.png)

19\. Add docker username as another variable with key “DOCKER_USERNAME”.

![](https://miro.medium.com/v2/resize:fit:736/1*C1KAV83DZ78nudeoa6yQxA.png)

20\. Similarly docker password as another variable with key “DOCKER_PASSWORD”.

![](https://miro.medium.com/v2/resize:fit:736/1*U2ROGUDgaYtr2tW9QWmcOA.png)

### **STEP 3 :- Create EKS Cluster**

1. Navigate to EKS-TF folder.
2. Change backend.tf and variables.tfvars as before.
3. Initialize the backend by running the below command.

```bash
terraform init
```

4\. Run the below command to get the blueprint of what kind of AWS services will be created.

```bash
terraform plan -var-file=variables.tfvars
```

5\. Now, run the below command to create the infrastructure on AWS Cloud which will take 3 to 4 minutes maximum.

```bash
terraform apply -var-file=variables.tfvars --auto-approve
```

6\. This will create an EKS cluster on AWS.

![](https://miro.medium.com/v2/resize:fit:736/1*KiWXz1fp2zjLD9dKowaeGQ.png)

7\. To apply the yaml files we need to give access to GitLab runner to access our cluster.

8\. Add access key as another variable with key “AWS_ACCESS_KEY_ID”.

![](https://miro.medium.com/v2/resize:fit:736/1*pSpl7eBs2s6nAoexXJp8ZA.png)

9\. Similarly add secret access key as a variable with key “AWS_SECRET_ACCESS_KEY”.

![](https://miro.medium.com/v2/resize:fit:736/1*XG5YMXCFoBc8EEC7RmhOmw.png)

10\. Add region as another variable with key “AWS_REGION”.

![](https://miro.medium.com/v2/resize:fit:736/1*jdJcWPGXOgu2Xtyg70a6RA.png)

### **STEP 4 :- Install and Configure GitLab Runner on EC2**

1. Navigate to settings then CICD and then runners.

![](https://miro.medium.com/v2/resize:fit:736/1*Fwc7s9HF5NmOOnq3J0twmA.png)

2\. Expand runners and click on 3 dots and then “show runner installations and registration instructions”

![](https://miro.medium.com/v2/resize:fit:736/1*4vvlMKs1A-p7e9f1cGDf4w.png)

3\. Select Linux as environment and copy all commands under “Download and install binary”.

![](https://miro.medium.com/v2/resize:fit:736/1*IPvRba4nXnlfyMamHcmmgg.png)

4\. Add all of then in a file with any name and then give execute permissions for it and execute it.

![](https://miro.medium.com/v2/resize:fit:736/1*iZmamE9WzPM8XkEf-5Cxuw.png)

5\. Copy last command from GitLab and paste it on EC2 server.  
Leave all of them as default but add your custom tags with commas(,)

![](https://miro.medium.com/v2/resize:fit:736/1*wjyWGNYmsPjzY6h9acF_aw.png)

6\. Start and run the GitLab-runner.

```bash
sudo gitlab-runner start
sudo gitlab-runner run
```

![](https://miro.medium.com/v2/resize:fit:736/1*6DjDss7pG0hlDtdaaVqGHw.png)

7\. This will add a runner in GitLab.

![](https://miro.medium.com/v2/resize:fit:736/1*6fhaFYfFhaIK0gefT3ZrCA.png)

8\. Edit it and check “Run untagged jobs”.

![](https://miro.medium.com/v2/resize:fit:736/1*bV2qAUxGm6mjlUssLkxqAw.png)

9\. Now create a file with .gitlab-ci.yml file add this content.

```yaml
stages:
  - npm
  - sonar
  - trivy file scan
  - docker
  - trivy image scan
  - deploy
Install dependecy:
  stage: npm
  image:
    name: node:16
  script:
    - npm install
sonarqube-check:
  stage: sonar
  image:
    name: sonarsource/sonar-scanner-cli:latest
    entrypoint: [""]
  variables:
    SONAR_USER_HOME: "${CI_PROJECT_DIR}/.sonar" # Defines the location of the analysis task cache
    GIT_DEPTH: "0" # Tells git to fetch all the branches of the project, required by the analysis task
  cache:
    key: "${CI_JOB_NAME}"
    paths:
      - .sonar/cache
  script:
    - sonar-scanner
  allow_failure: true
  only:
    - main
Trivy file scan:
  stage: trivy file scan
  image:
    name: aquasec/trivy:latest
    entrypoint: [""]
  script:
    - trivy fs .
Docker build and push:
  stage: docker
  image:
    name: docker:latest
  services:
    - docker:dind
  script:
    - docker build  -t amazon .
    - docker tag amazon sreedhar8897/amazon:latest
    - docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
    - docker push sreedhar8897/amazon:latest
Scan image:
  stage: trivy image scan
  image:
    name: aquasec/trivy:latest
    entrypoint: [""]
  script:
    - trivy image sreedhar8897/amazon:latest
deploy:
  stage: deploy
  tags:
    - amazon
  script:
    - docker run -d --name amazon -p 3000:3000 sreedhar8897/amazon:latest
    - aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
    - aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
    - aws configure set region $AWS_REGION
    - aws eks --region us-east-1 update-kubeconfig --name Amazon-EKS-Cluster
    - kubectl apply -f deployment-service.yml
```

Replace the image names and cluster name as you created.

10\. Then Commit the changes.

11\. This will automatically create a pipeline and run it you can view it under build → pipeline section.

12\. Upon successful execution.

![](https://miro.medium.com/v2/resize:fit:736/1*EWfi8xmP-GrivC4CgldD_A.png)

**SonarQube Analysis:**

![](https://miro.medium.com/v2/resize:fit:736/1*oV_6_5ZyE-O9gNIoihoDgw.png)

**Trivy File Scan:**

![](https://miro.medium.com/v2/resize:fit:736/1*7OSi-RGmTHERX1boTEtDig.png)

**Trivy Image Scan:**

![](https://miro.medium.com/v2/resize:fit:736/1*pA2SAn1-Ca8_bzZdAzM8wA.png)

**Docker Hub:**

![](https://miro.medium.com/v2/resize:fit:736/1*8NT8-lNZvZnxvyh-pQGtIQ.png)

13\. Ensure that the resources are up and running.

```bash
kubectl get all
```

![](https://miro.medium.com/v2/resize:fit:736/1*XvXikc3enC1l1ELzNrh7DQ.png)

14\. Access the application on port 3000 of EC2 server.  
Note: Enable port 3000 in Security Group of EC2.

![](https://miro.medium.com/v2/resize:fit:736/1*7n1SUUs7SWoqJ5hqo7gsyQ.png)

15\. This will create a Load Balancer on AWS.

![](https://miro.medium.com/v2/resize:fit:736/1*xRdMyvLBKGrLJspQ7JpeZA.png)

16\. Copy the DNS name and paste it on your favourite browser.

![](https://miro.medium.com/v2/resize:fit:736/1*6Nt_4-ozkAokN1EugX41Dw.png)

![](https://miro.medium.com/v2/resize:fit:736/1*ATFgekJPUbwbvN2dSJqSJw.png)

Another feature of GitLab is it will send notification to registered email the status of pipeline.

![](https://miro.medium.com/v2/resize:fit:736/1*d8beAQcActOW5sggCs9K2Q.png)

### **STEP 5 :- Clean Up**

1. This is very simple first delete the EKS cluster by running

```bash
cd EKS-TF/
terraform destroy -var-file=variables.tfvars --auto-approve
```

![](https://miro.medium.com/v2/resize:fit:736/1*uqAjeUw1EjzcF2P0Vols0g.png)

2\. Destroy the GitLab Server by running.

```bash
cd GitLab-Server-TF/
terraform destroy -var-file=variables.tfvars --auto-approve
```

![](https://miro.medium.com/v2/resize:fit:736/1*naTP6bz1i-iGapsjzWcRcA.png)

**_Thank you for reading my blog …:)_**

If you find this article helpful then you can [**buy me a coffee**](https://www.buymeacoffee.com/harshhaareddy)**.**

Follow for more stories like this 😊/ [**GitHub**](https://github.com/NotHarshhaa)**.**
