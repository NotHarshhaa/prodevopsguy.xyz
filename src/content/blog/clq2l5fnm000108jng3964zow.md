---
author: ProDevOpsGuy Team
pubDatetime: 2024-04-26T16:57:24Z
title: Microservice Delivery on Kubernetes using Jenkins, Helm Charts, and Argo CD
slug: microservice-delivery-on-kubernetes-using-jenkins-helm-charts-and-argo-cd
ogImage: "/assets/1060d81a-d0e4-4f3c-af50-cb737f7c7b41.jpeg"
featured: false
draft: false
tags:
  - microservices
  - kubernetes
  - devops
  - helm
  - ci-cd
description: DevOps Project - Microservice Delivery on Kubernetes using Jenkins, Helm Charts, and Argo CD
---

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1702399517160/1060d81a-d0e4-4f3c-af50-cb737f7c7b41.jpeg)

## **Introduction**

In the modern software development landscape, microservices and Kubernetes have become a preferred choice for building and deploying applications. The decoupled nature of microservices allows for scalability and maintainability. However, the management and delivery of these services on Kubernetes often present new challenges.

**Some of these challenges include:**

1. Configuration Management: Handling the configuration of a large number of microservices can be complex and time-consuming, requiring a robust solution.
2. Continuous Integration and Continuous Delivery (CI/CD) with Rollbacks and Version Control: Ensuring that applications are always up-to-date and having the ability to quickly revert to a stable previous version in case of issues are essential for maintaining a reliable software delivery pipeline.
3. Monitoring Multiple Deployments: Keeping track of the status and health of various deployments across the Kubernetes cluster can be overwhelming without proper tools and automation.

Through this blog post, we will showcase an efficient solution to tackle these challenges using Jenkins, Helm charts, and ArgoCD.

Before we dwell deep into the Microservice Delivery Solution it’s crucial to have a robust Infrastructure in place for deploying these services. One popular tool for infrastructure provisioning and management is Terraform. By leveraging Terraform, you can define your infrastructure as code and ensure consistent and repeatable deployments.

At SquareOps, we have created a comprehensive guide on building the infrastructure for microservices on AWS using Terraform. We highly recommend referring to our GitHub repository [https://github.com/squareops](https://github.com/squareops) for detailed instructions and code samples.

In that guide, you will find step-by-step instructions on configuring the necessary resources such as Virtual Private Cloud (VPC), subnets, security groups, EKS cluster and Elastic Load Balancers (ELBs). Additionally, we cover topics such as autoscaling groups, EKS add-ons, Amazon RDS for database management, and integrating AWS services with your microservices architecture. Now, let’s jump back to Helm, Jenkins and ArgoCD for deployment.

## **Streamlining Microservices with Helm Charts**

Helm, the package manager for Kubernetes, is at the core of our solution. Helm charts are a collection of files that describe a related set of Kubernetes resources. They provide a method to deploy applications onto the Kubernetes platform smoothly.

We maintain a single Git repository for all services’ Helm charts. Our structure includes a main chart, with each microservice chart added as a dependency. This approach enhances modularity and reusability, allowing each microservice to encapsulate its Kubernetes resources.

```bash
.
├── charts
│   ├── microservice-a
│   │   ├── Chart.yaml
│   │   ├── templates
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── ...
│   │   └── values.yaml
│   ├── microservice-b
│   │   ├── Chart.yaml
│   │   ├── templates
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── ...
│   │   └── values.yaml
│   └── ...
└── main-chart
    ├── Chart.yaml
    ├── values.yaml
    └── requirements.yaml
```

In this structure:

- The `charts` directory contains a subdirectory for each microservice, which in turn includes its specific Helm chart.
- Each microservice chart consists of a `Chart.yaml` file (the chart description), `values.yaml` file (the default configuration values), and a `templates` directory that contains the Kubernetes resource definitions.
- The `main-chart` directory contains the main Helm chart. It includes a `Chart.yaml` file, a `values.yaml` file, and `requirements.yaml` file that lists each microservice chart, under `/charts` directory, as a dependency.

## **Application Environment Setup with ArgoCD**

ArgoCD, a declarative GitOps continuous delivery tool for Kubernetes, ensures that our cluster configuration matches the state specified in the Git repository. It is a powerful tool that simplifies the process of deploying your applications configured with Helm charts.

Here, we’ll illustrate the steps to quickly use the Helm Git repository to create an application on the ArgoCD user interface (UI):

1. Log into the ArgoCD UI: First, log into the ArgoCD UI using your credentials. The UI is typically accessed via a web browser at the ArgoCD server’s host.
2. Once logged in, Connect the Git repository for the Helm chart under Settings.
3. Navigate to the “Applications” page and click on the “New Application” button.
4. Fill in the Application Details and Create the Application:

- - Application Name: Choose a name for your application.
    - Project: Select the ArgoCD project where your application will reside.
    - Sync Policy: Choose ‘Manual’ for the start, you can change it to ‘Automatic’ later based on your requirements.
    - Repository URL: Select the Git URL of your Helm charts repository.
    - Revision: Specify the Git revision of your Helm charts repository (for example, a branch name like master or main).
    - Helm Chart: Enter the path to your main Helm chart within the repository (for example, the main chart).
    - Values Files: Add the path to your environment-specific values.yaml file in your repository. This file contains configuration overrides for your microservice Helm templates.

ArgoCD will fetch the specified Helm chart from your Git repository, apply the configuration overrides from your `values.yaml` file, and deploy the application to your Kubernetes cluster. By keeping separate `values.yaml` files for different environments, we can manage environment-specific configurations efficiently and prevent unnecessary conflicts.

Once your application is deployed, you can monitor its status and health directly from the ArgoCD UI. Click on your application to view its details. Here you will see a visualization of your application’s dependencies and related Kubernetes resources. This graph is an incredibly useful feature of ArgoCD that lets you see the state of your application at a glance.

![](https://squareops.com/wp-content/uploads/2023/06/argo-cd-1024x560.png)

In this way, ArgoCD provides a convenient and visual way to manage your microservices deployed on Kubernetes. By leveraging the power of Helm charts and GitOps, you can ensure consistency and reliability in your deployments.

## **Building and Deploying with Jenkins Pipeline**

Jenkins, a popular open-source automation server, is our tool of choice for Continuous Integration and Continuous Deployment (CI/CD). With its multibranch pipeline feature, we can create and manage a pipeline for each branch in our Git repository.

Here’s an example of a Jenkins multibranch pipeline for a Node.js application:

```yaml
pipeline {
    agent any
    environment {
        ECR_REPO_NAME = 'your-ecr-repo-name'
        ECR_URL = 'https://your-ecr-url'
        GIT_CREDENTIALS_ID = 'your-git-credentials-id'
    }
    stages {
        stage('Unit Test') {
            when { changeRequest target: 'develop' }
            steps {
                sh 'npm test'
            }
        }
        stage('Docker Build and Push') {
           when { anyOf { branch 'develop'; branch 'master' } }
            steps {
                script {
                    docker.build("${ECR_REPO_NAME}:${env.BUILD_NUMBER}")
                    docker.withRegistry(ECR_URL, "ecr:us-west-2:${env.CREDENTIALS_ID}") {
                        docker.push("${ECR_REPO_NAME}:${env.BUILD_NUMBER}")
                    }
                }
            }
        }
        stage('Approval') {
           when { anyOf { branch 'develop'; branch 'master' } }
            steps {
                input 'Deploy to environment?'
            }
        }
        stage('Deploy') {
           when { anyOf { branch 'develop'; branch 'master' } }
            steps {
                script {
                    // Determine the environment based on the branch
                    def env = (env.BRANCH_NAME == 'develop') ? 'development' : 'production'
                    // Clone the Helm chart repo
                    git credentialsId: GIT_CREDENTIALS_ID, url: 'https://github.com/your-helm-chart-repo'
                    // Update the Docker image tag in the values.yaml file
                    sh """
                        sed -i 's|image: .*|image: ${ECR_URL}/${ECR_REPO_NAME}:${env.BUILD_NUMBER}|' ${env}/values.yaml
                    """
                    // Commit and push the changes
                    sh """
                        git add ${env}/values.yaml
                        git commit -m "Update Docker image tag for ${env} environment"
                        git push origin HEAD
                    """
                }
            }
        }
    }
}
```

In this Jenkinsfile, the Unit Test stage runs only when a pull request is raised from a branch matching the feature-\* pattern to the develop branch.

The Docker Build and Push and Approval stages run only for the develop and master branches. the pipeline builds Docker images and pushes them to the Amazon Elastic Container Registry (ECR)

On a successful push to ECR, the pipeline triggers a manual approval step for deployment on the development and production environments, respective to the development and master branches.

![Jenkins-pipeline-squareops](https://squareops.com/wp-content/uploads/2023/06/jenkins-pipelines-1024x590.png)

The Deploy stage includes steps to clone the Helm chart repo and update the Docker image tag in the respective environment’s values.yaml file, and push the changes back to the Git repository. The environment is determined based on the branch name.

### **Conclusion**

**The combination of Kubernetes, Jenkins, Helm Charts, and ArgoCD** provides a comprehensive solution to seamless Microservice Onboarding, to Kubernetes efficiently.

At SquareOps Technologies, we specialize in implementing advanced pipeline workflows that include DevSecOps, performance testing, Blue-green deployments, Rollbacks, DB migrations, Notifications etc.

We can offer an in-depth, customized implementation to expedite your microservice onboarding process. Contact us today to discover how we can optimize your microservice delivery.

If you find this article helpful then you can [**buy me a coffee**](https://www.buymeacoffee.com/harshhaareddy)**.**

Follow for more stories like this 😊/ [**GitHub**](https://github.com/NotHarshhaa)**.**
