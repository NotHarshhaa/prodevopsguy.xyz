---
author: ProDevOpsGuy Team
pubDatetime: 2024-06-19T08:18:14Z
title: How to Deploy a JavaScript Tetris-Game-App on Azure CICD Pipeline and App Service
slug: how-to-deploy-a-javascript-tetris-game-app-on-azure-cicd-pipeline-and-app-service
featured: false
draft: false
tags:
  - Azure
  - Azure DevOps
  - ci-cd
description: In this project, we will attempt to deploy a JavaScript based game app. At the end of this project we should be able to play the actual game and be able to understand the steps needed in deploying similar apps in production.
---

**Steps needed.**

Step 1 — Create ACR  
Step 2 — Create a new project in Azure DevOps  
Step 3 — Create 2 service connections in Azure DevOps (ACR and GitHub)  
Step 4 — Create build pipeline and run the job  
Step 5 — Create Azure Webapp Container  
Step 6 — Create release pipeline  
Step 7 — Verify CICD pipeline by adding a new feature to the app.

**_Objectives:_**

1. _Able to create and deploy apps with azure cicd pipeline._

2. _Understand the use of azure portal and azure devops_

**_Pre-requisites:_**

1. _You must have an azure account and azure devops subscription._

2. _You must have basic knowledge of docker and how to create Dockerfile._

3. _You must have basic Javascript knowledge._

Now, lets move to the first step of this project.

## **Step 1 — Create Azure Container Registry:**

![](https://miro.medium.com/v2/resize:fit:700/1*ucg2jJlbeMUXfhyBAYFz3A.gif)

How to create Azure Container Registries

a. Login into the Azure Portal and create an Azure Container Registry. [https://portal.azure.com/](https://portal.azure.com/)

b. Search for `Container Registry`on the search bar.

c. **_Note: If you don’t have a_** `resource group` **_yet you may have to create it first._** Click on `Create` and fill in the details as shown above. After filling in the details, click on `Review and Create`

d. Wait for the resource to finish deploying, Click `go to resource` &gt; on the left menu click on `Access Keys` &gt; Check `Admin user`

The `Access Keys` in Container Registries is essential for the security and proper functioning of our Containerized apps. It is typically used for authentication and authorization when interacting with the CR.

## **Step 2 — Create a new project in Azure Devops:**

Creating a project in Azure DevOps serves as an organizational unit that helps you manage and organize your work, source code, builds, releases, and other aspects of your software development lifecycle.

![](https://miro.medium.com/v2/resize:fit:700/1*grD4-41kN4NcUpeIGQVaJg.gif)

How to create a project on Azure Devops

a. Go to dev.azure.com

b. Click on Create `New Project` on the top right corner.

c. Input your project name and other details

d. Click `Create`

## **Step 3 — Create 2 service connections in Azure devops (ACR and GitHub)**

Service Connections helps to manage authentication and integrate with external services. They help to enhance security, simplify configuration, and contribute to the overall efficiency of CI/CD pipelines and other automation processes within the development lifecycle.

![](https://miro.medium.com/v2/resize:fit:700/1*u4OoPnZALAI4FEnf3zgckQ.gif)

How to create a service connection

We will be creating two service connections. One is for the GitHub (because of our code is stored in GitHub) we need to establish a connection that can authenticate to it. Second is for the service connection that authenticates to our docker image repo located in`Azure Container Registry`.

- **To create the Service Connections that authenticates to our code in GitHub.**

a. From the project page, scroll down on the left menu. Click on `Project settings`

b. When the page opens up, scroll down and click on `Service connections` still on the left menu.

c. Click on `Create your first service connection` if this is your first, else.. click on `New service connection` .

d. Search for GitHub or scroll down to find it. Click on the OAuth configuration and select `AzurePipeline` . Click `Authorize`

e. Type in the name of your service connections. Fill in the details as required or as shown in the gif image above. Click `Save`

**_NOTE: Make sure to check the_** `Grant access permission to all pipelines` **_._**

- **To create the Service Connections that authenticates to our docker image in the ACR repo.**

a. Click on `New service connection`

b. Search for docker registry or scroll down to find it. Select it and Click `Next` .

c. At the top of the page, select `Azure Container Registry` as the registry type.

d. For authentication type, select `Service Principal` , the subscription should automatically be inputted if not, select it

e. In the next field, Select the name of your `Azure Container Registry.`

f. Optional, type in your `service connection name` . Check the `Grant access permission to all pipelines` and click `Save` .

Granting access permissions when creating a service connection in Azure Pipelines is a crucial security and governance practice. It ensures that the service connection is properly authenticated, authorized, and aligned with the principle of least privilege, contributing to a secure and controlled integration between Azure DevOps and external services.

## **Step 4 — Create build pipeline and run the job**

In this section we are going to build a docker image and push the image to the container registry created earlier. Our Dockerfile is located in Github. Here is the GitHub repo if you’d like to use the same code as I did. [https://github.com/ougabriel/tetris-game-app.git](https://github.com/ougabriel/tetris-game-app.git).

![](https://miro.medium.com/v2/resize:fit:700/1*wYpThcc0duFje2Co6eKkPA.gif)

How to build and push image to azure container registry

a. From the left menu, click `pipeline` , in the open page you have to click `Create pipeline`

b. CONNECT, the GitHub repo. Click on GitHub (yaml) from the list

c. SELECT, the repo from the list. In this case I selected the repo `ougabriel/tetris-game-app` .

d. CONFIGURE, select from the list with the details `Docker (Build and push image to azure container registry)`

\&gt; Select your subscription, click `Continue`

\&gt; From the drop-down menu, select your `container registry` which was created earlier. | The `image name` will be automatically populated or you can give it your own name. | Leave Dockerfile section as default

\&gt; Click `Validate and configure` ( the yaml file will be configured)

e. REVIEW, leave the `azure-pipelines.yml` file as default. We won’t be changing anything here. Click `Save and run`

_NOTE: After the build, go to the azure portal &gt; open the ACR created earlier &gt; Scroll down to repositories to see the new docker image._

_Go to your GitHub repo page to see the_ `azure-pipelines.yml` _file which has been added._

## **Step 5 — Create Azure Webapp Container**

Since, we have already deployed our docker image. Next, we will attached this image to an Azure WebApp. When this is attached, the image is deployed into it and then we can interact with the Tetris game.

![](https://miro.medium.com/v2/resize:fit:700/1*xom25bKETK8Jas4jivEPIQ.gif)

How to create a webapp in azure.

a. Navigate to App Services:

- In the Azure portal, click on `Create a resource`, and choose “Web App.”

b. Configure Web App Basics:

In the “Basics” tab of the Web App creation wizard:

Choose a unique App name. &gt; Select your subscription. &gt; Create or select a Resource Group. &gt; Choose an Operating System (Linux). &gt; Choose a Region. &gt; Select a Runtime Stack (e.g., Node.js, Python, .NET Core). &gt; Choose the `Docker Container`option under Publish.

c. Configure Container:

- In the “Container” section of the wizard &gt; Choose `Single container >`Provide the Image Source (choose the ACR where your image is located).

d. Configure App Service Plan:

In the “App Service Plan” section:

- Create a new App Service Plan or select an existing one. &gt; Choose the SKU (size) of the plan based on your requirements.

e. Configure Monitoring and Management: (Leave as default)

f. Review your configurations, and click on the “Review + create” button.

## **Step 6 — Create release pipeline**

![](https://miro.medium.com/v2/resize:fit:700/1*thipNvtn8YgTZh5xDMbL9g.gif)

a. From the menu Click “Pipelines” section and select “Releases” from the sub-menu.

b. Create a New Release Pipeline &gt;

c. In the pop window. We can either choose `empty job` but for the sake of this project, select `Azure App Service deployment`

- A release pipeline typically consists of one or more stages, such as “Dev,” “Test,” and “Production.” Define the stages that represent your deployment workflow. In this project we will use the default which is stage 1

d. Add Artifacts:

- Link the artifacts produced by build pipeline which we did earlier to the release pipeline. Click on “Add an artifact” and select the source type.

![](https://miro.medium.com/v2/resize:fit:212/1*jLry3llRHMGiiiqHPxYKAw.png)

Enable Continuous deployment trigger

- Click on the thunderbolt and enable `Continuous deployment trigger` _(this will ensure any changes made on the code will automatically be triggered)_

e. Add Stage configuration.

- click on the `1job 1task` as shown in the image above. &gt; Select your subscription &gt; for `app type` _select_ `WebApp for Containers (Linux)` _&gt;_ for `app service name` select the name of your `WebApp` which was created earlier. &gt; for `registry name` copy and paste the url of your ACR. &gt; for the `repo` go back to the azure portal on the left menu, select the repo and paste the name on the given field

f. Click `Save` _and then click_ `Create release` _&gt; Once the deployment is done, you can view the logs. and other details as shown above._

## **Step 7 — Verify CICD pipeline by adding a new feature to the app.**

In this section, We are going to test our release pipeline trigger. To do this we are going to edit the `Lets Play` section of the code; and then change its present value to a different color such as yellow or green or blue.

![](https://miro.medium.com/v2/resize:fit:700/1*jhWr72pqeWr7WZi7x86Wig.gif)

How to edit a code and trigger the release pipeline

a. There are several ways to do this, however I will be using the vscode.

b. Clone the repo `git clone https://github.com/ougabriel/tetris-game-app.git`

_\&gt; CD into the directory_ `cd tetris-game-app` _&gt; edit the lets play part of the code_ `nano tetris.js` _(press_ **_ctrl w_** _to search and_ **_ctrl o_** _to write)_

_\&gt; Stage the edit_ `git add .`

_\&gt; Commit the edit_ `git commit -m “Changed the lets play font colour to yellow”`

_\&gt; Push the code_ `git push -u origin main`

## **Conclusion:**

I hope this project has been of a great help to you, if you do have any questions or recommendations please leave a comment and I will be glad to respond to you.

**To delete the deployment**

- Delete the `resource group`(this will delete all services and deployment within it)

- In the azure devops page delete the project by scrolling down to `project settings`

---

## Author by

![](https://imgur.com/2j6Aoyl.png)

> Join Our [Telegram Community](https://t.me/prodevopsguy) || [Follow me](https://github.com/NotHarshhaa) for more DevOps Content.
