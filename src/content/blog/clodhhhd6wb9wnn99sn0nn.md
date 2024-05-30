---
author: ProDevOpsGuy Team
pubDatetime: 2024-05-29T10:23:22Z
title: Create a GitHub Actions Workflow to Deploy Terraform Code to Azure
slug: create-a-github-actions-workflow-to-deploy-terraform-code-to-azure
ogImage: https://i.ibb.co/PxQkHz9/1-JB6-UOyosibyt20-MJuie-Rog.jpg
featured: true
draft: false
tags:
  - azure
  - github
  - devops
  - terraform
  - ci-cd
description: In this Blog, we will create a GitHub Actions workflow to deploy Terraform code in Azure (without using Terraform Cloud).
---

![alt text](https://miro.medium.com/v2/resize:fit:1400/1*JB6UOyosibyt20MJuieRog.jpeg)

# Blog Info:

This involves setting up a CI/CD pipeline that executes directly in our GitHub repository. This setup will handle the initialization, planning, and application of our Terraform code.

## **1\. Prerequisites**

Below is the list of prerequisites required to create a GitHub Actions CI/CD pipeline:

- **Azure Subscription:** If we don't have an Azure subscription, we can create a free account at [https://azure.microsoft.com](https://azure.microsoft.com/) before we start.
- **Azure Service Principal:** This is an identity used to authenticate to Azure. Below are the instructions for creating one.
- **Azure Remote Backend for Terraform:** we will store our Terraform state file in a remote backend location. We will need a Resource Group, an Azure Storage Account, and a Container.

## **2\. Configuring the Remote Backend**

We will need a place to store the Terraform state so that we will use an Azure Storage Account.

We must create a dedicated resource group, storage account, and a blob container in Azure.

We provide three ways to achieve this: BASH script, PowerShell script, and Terraform code.

## **2.1. Configuring the Remote Backend to use Azure Storage with Azure CLI and BASH**

Execute the following **BASH script** to create the storage account in Azure CLI or Azure Cloud Shell:

```go
RESOURCE_GROUP_NAME=kopicloud-tstate-rg
STORAGE_ACCOUNT_NAME=kopicloudgitlabtfstate
CONTAINER_NAME=tfstate

# Create resource group
az group create --name $RESOURCE_GROUP_NAME --location "West Europe"

# Create storage account
az storage account create --resource-group $RESOURCE_GROUP_NAME --name $STORAGE_ACCOUNT_NAME --sku Standard_LRS --encryption-services blob

# Get storage account key
ACCOUNT_KEY=$(az storage account keys list --resource-group $RESOURCE_GROUP_NAME --account-name $STORAGE_ACCOUNT_NAME --query [0].value -o tsv)

# Create blob container
az storage container create --name $CONTAINER_NAME --account-name $STORAGE_ACCOUNT_NAME --account-key $ACCOUNT_KEY

echo "storage_account_name: $STORAGE_ACCOUNT_NAME"
echo "container_name: $CONTAINER_NAME"
echo "access_key: $ACCOUNT_KEY"
```

## **2.2. Configuring the Remote Backend to use Azure Storage with PowerShell**

Execute the following **Azure PowerShell** script to create the storage account in **Azure Storage**:

```go
# Variables
$azureSubscriptionId = "9c242362-6776-47d9-9db9-2aab2449703"
$resourceGroup = "kopicloud-tstate-rg"
$location = "westeurope"
$accountName = "kopicloudgitlabtfstate"
$containerName = "tfstate"

# Set Default Subscription
Select-AzSubscription -SubscriptionId $azureSubscriptionId

# Create Resource Group
New-AzResourceGroup -Name $resourceGroup -Location $location -Force

# Create Storage Account
$storageAccount = New-AzStorageAccount -ResourceGroupName $resourceGroup `
  -Name $accountName `
  -Location $location `
  -SkuName Standard_RAGRS `
  -Kind StorageV2

# Get Storage Account Key
$storageKey = (Get-AzStorageAccountKey -ResourceGroupName $resourceGroup `
  -Name $accountName).Value[0]

# Create Storage Container
$ctx = $storageAccount.Context
$container = New-AzStorageContainer -Name $containerName `
  -Context $ctx -Permission blob

# Results
Write-Host
Write-Host ("Storage Account Name: " + $accountName)
Write-Host ("Container Name: " + $container.Name)
Write-Host ("Access Key: " + $storageKey)
```

## **2.3. Configuring the Remote Backend to use Azure Storage with Terraform**

We can also use Terraform to create the storage account in **Azure Storage.**

First, we will create a file for the Terraform and Azure providers called `provider.tf`, and we will add the following code:

```go
terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
        version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}
```

After that, we create a file called `variables.tf`, and add this code:

```go
# azure region
variable "location" {
  type        = string
  description = "Azure region where resources will be created"
  default     = "west europe"
}
```

Then, we create the `main.tf` file that will configure the storage account:

```go
# Create a Resource Group for the Terraform State File
resource "azurerm_resource_group" "state-rg" {
  name     = "kopicloud-tfstate-rg"
  location = var.location
}

# Create a Storage Account for the Terraform State File
resource "azurerm_storage_account" "state-sta" {
  depends_on = [azurerm_resource_group.state-rg]

  name                = "kopicloudgitlabtfstate"
  resource_group_name = azurerm_resource_group.state-rg.name
  location            = azurerm_resource_group.state-rg.location

  account_kind = "StorageV2"
  account_tier = "Standard"
  access_tier  = "Hot"

  account_replication_type  = "ZRS"
  enable_https_traffic_only = true
}

# Create a Storage Container for the Core State File
resource "azurerm_storage_container" "core-container" {
  depends_on = [azurerm_storage_account.state-sta]

  name                 = "tfstate"
  storage_account_name = azurerm_storage_account.state-sta.name
}
```

Finally, we create the file `output.tf` file that will show the output:

```go
output "terraform_state_resource_group_name" {
  value = azurerm_resource_group.state-rg.name
}

output "terraform_state_storage_account" {
  value = azurerm_storage_account.state-sta.name
}

output "terraform_state_storage_container_core" {
  value = azurerm_storage_container.core-container.name
}
```

## **3\. Creating our GitHub Repository**

The first (optional) step is to create a GitHub Repo:

![None](https://miro.medium.com/v2/resize:fit:700/1*-Lij7P8RK5OopJUpQStO0Q.png)

Then, in the next step, we will create a simple code to validate the Terraform deployment.

## **4\. Adding Sample Terraform Code**

First, we will add a `main.tf` file to create a Resource Group, a VNET, and a Subnet.

```go
# Create the Resource Group
resource "azurerm_resource_group" "this" {
  name     = "kopicloud-github-actions-rg"
  location = "west europe"
}

# Create the VNET
resource "azurerm_virtual_network" "this" {
  name                = "kopicloud-github-actions-vnet"
  address_space       = ["10.10.10.0/16"]
  resource_group_name = azurerm_resource_group.this.name
  location            = azurerm_resource_group.this.location
}

# Create the Subnet
resource "azurerm_subnet" "this" {
  name                 = "kopicloud-github-actions-subnet"
  address_prefixes     = ["10.10.10.0/24"]
  virtual_network_name = azurerm_virtual_network.this.name
  resource_group_name  = azurerm_resource_group.this.name
}
```

Then, there is a file `provider.tf` with references to the Terraform and Azure providers.

```go
# Define the Terraform provider
terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
        version = "~> 3.100"
      }
  }
  backend "azurerm" {
    key = "demo.tfstate"
  }
}

# Define the Azure provider
provider "azurerm" {
  features {}
  environment = "public"
}
```

## **5\. Creating an Azure Service Principal**

Using a **Service Principal**, or **SPN**, is a best practice for DevOps or CI/CD environments.

First, we log into Azure, open the **Azure Shell Cloud** (or the Azure CLI), and select **BASH**.

![None](https://miro.medium.com/v2/resize:fit:700/1*4B6yW8pRadpO97QQNSGVPg.png)

After that, we are ready to start.

We will use the following command to get the list of Azure subscriptions:

```go
az account list --output table
```

We can select the subscription using the following command (both subscription ID and subscription name are accepted):

```go
az account set --subscription <Azure-SubscriptionId>
```

Then, we create the service principal account using the following command:

```go
az ad sp create-for-rbac --role="Contributor" --name="Terraform" --scopes="/subscriptions/SUBSCRIPTION_ID"
```

Below is the result of the execution:

```go
{
  "appId": "43cbab46-8ef2-4f3e-b2ca-9ac33cb02369",
  "displayName": "Terraform",
  "password": "-lo8Q~xIjKpffrjGORmg6q79nzGLK3sq1Jb-gbLL",
  "tenant": "6795c202-cca8-18a9-cb61-d75a46b35eaf"
}
```

These values will be mapped to these Terraform variables:

- **appId** (Azure) → **client_id** (Terraform).
- **password** (Azure) → **client_secret** (Terraform).
- **tenant** (Azure) → **tenant_id** (Terraform).

## **6\. Configuring GitHub Repository Secrets**

We add the following secrets to our GitHub repository.

We navigate to `Settings` **&gt;** `Security`**;** then, we expand the `Secrets and variables`option.

We click on the `Actions` menu and, after that, on the `New repository secret` button to add a secret.

![None](https://miro.medium.com/v2/resize:fit:700/1*O0psOQWLDg2d9RowJnItvQ.png)

Below is the list of secrets we need to add to Actions Secrets:

- `ARM_CLIENT_ID`: Our service principal appId (from the previous step).
- `ARM_CLIENT_SECRET`: Our service principal password (from the previous step).
- `ARM_SUBSCRIPTION_ID`: Our Azure subscription ID (from the previous step).
- `ARM_TENANT_ID`: Our tenant ID (from the previous step).
- `STORAGE_ACCOUNT`: Our Azure storage account name (from step 2).
- `RESOURCE_GROUP`: The resource group of our storage account (from step 2).
- `CONTAINER_NAME`: Our blob container name (from step 2).

And this is it:

![None](https://miro.medium.com/v2/resize:fit:700/1*BVO6OdGAR4Jk4tRwZqMzDg.png)

## **7\. Creating the Azure GitHub Actions Workflow File**

We create a file named `terraform.yml` within the `.github/workflows` directory, and we add this content:

```go
name: 'Terraform'

on: [push, pull_request]

env:
  TF_LOG: INFO
  ARM_CLIENT_ID: ${{ secrets.ARM_CLIENT_ID }}
  ARM_CLIENT_SECRET: ${{ secrets.ARM_CLIENT_SECRET }}
  ARM_TENANT_ID: ${{ secrets.ARM_TENANT_ID }}
  ARM_SUBSCRIPTION_ID: ${{ secrets.ARM_SUBSCRIPTION_ID }}
  RESOURCE_GROUP: ${{ secrets.RESOURCE_GROUP }}
  STORAGE_ACCOUNT: ${{ secrets.STORAGE_ACCOUNT }}
  CONTAINER_NAME: ${{ secrets.CONTAINER_NAME }}

jobs:
  terraform:
    name: 'Terraform'
    runs-on: ubuntu-latest

    defaults:
      run:
        shell: bash

    steps:
    # Checkout the repository to the GitHub Actions runner
    - name: Checkout
      uses: actions/checkout@v4

    # Install the preferred version of Terraform CLI
    - name: Setup Terraform
      uses: hashicorp/setup-terraform@v3
      with:
        terraform_version: 1.8.2

    # Initialize Terraform with an Azure storage account to store the Terraform State
    - name: Terraform Init
      id: init
      run: terraform init -backend-config="storage_account_name=$STORAGE_ACCOUNT" -backend-config="container_name=$CONTAINER_NAME" -backend-config="resource_group_name=$RESOURCE_GROUP"

    # Run Terraform plan for pull requests only
    - name: Terraform Plan
      if: github.event_name == 'pull_request'
      id: plan
      run: terraform plan -no-color

    # Run Terraform apply for push to the main branch
    - name: Terraform Apply
      if: github.ref == 'refs/heads/main' && github.event_name == 'push'
      run: terraform apply -auto-approve
```

## **8\. Explanation of Workflow Steps**

The first section will define the workflow triggers. We are set to trigger `push` or `pull` request events for the main branch.

Also, we are setting the Terraform logging level for `INFO`, and all the variables we are using in the workflow.

```go
name: 'Terraform'

on: [push, pull_request]

env:
  TF_LOG: INFO
  ARM_CLIENT_ID: ${{ secrets.ARM_CLIENT_ID }}
  ARM_CLIENT_SECRET: ${{ secrets.ARM_CLIENT_SECRET }}
  ARM_TENANT_ID: ${{ secrets.ARM_TENANT_ID }}
  ARM_SUBSCRIPTION_ID: ${{ secrets.ARM_SUBSCRIPTION_ID }}
  RESOURCE_GROUP: ${{ secrets.RESOURCE_GROUP }}
  STORAGE_ACCOUNT: ${{ secrets.STORAGE_ACCOUNT }}
  CONTAINER_NAME: ${{ secrets.CONTAINER_NAME }}
```

The next step is to define the jobs. We will create one job that will run it on a GitHub-hosted runner using the latest **Ubuntu** machine, and we are setting the shell to `bash.`

```go
jobs:
  terraform:
    name: 'Terraform'
    runs-on: ubuntu-latest

    defaults:
      run:
        shell: bash
```

After that, it is time for the initialization. The `checkout` step performs a checkout of the code in our repository, and the `setup-terraform` step installs the Terraform binary on the GitHub runner.

```go
steps:
    # Checkout the repository to the GitHub Actions runner
    - name: Checkout
      uses: actions/checkout@v4

    # Install the preferred version of Terraform CLI
    - name: Setup Terraform
      uses: hashicorp/setup-terraform@v3
      with:
        terraform_version: 1.8.2
```

The next step is to run the `terraform init` command to initialize the Terraform with an Azure Storage Account. We will use this Storage Account to store the Terraform State.

```go
# Initialize Terraform with an Azure storage account to store the Terraform State
- name: Terraform Init
  id: init
  run: terraform init -backend-config="storage_account_name=$STORAGE_ACCOUNT" -backend-config="container_name=$CONTAINER_NAME" -backend-config="resource_group_name=$RESOURCE_GROUP"
```

Following is the `terraform plan` step. The workflow checks if this is a pull request event; in that case, we run the `terraform plan` command.

The `terraform plan` command creates an execution plan, previewing the changes Terraform plans to make to our infrastructure.

```go
# Run Terraform plan for pull requests only
- name: Terraform Plan
  if: github.event_name == 'pull_request'
  id: plan
  run: terraform plan -no-color
```

The `terraform apply` step will create, update, or destroy our Azure infrastructure.

This step is conditional and runs only on pushes to `main` branch to avoid accidental deployments.

```go
# Run Terraform apply for push to the main branch
- name: Terraform Apply
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  run: terraform apply -auto-approve
```

## **9\. Executing the CI/CD Pipeline**

After we commit the workflow file to the repo, the CI/CD will be executed for the first time.

![None](https://miro.medium.com/v2/resize:fit:700/1*7VspqRQdtdi9EfW3ufczNA.png)

If we click on the workflow run result, we can see the execution details:

![None](https://miro.medium.com/v2/resize:fit:700/1*rN1z-KS2D8USPqh76WnWcw.png)

Finally, we click on the Terraform label (next to the green check), and we can see all the steps executed by the pipeline:

![None](https://miro.medium.com/v2/resize:fit:700/1*yoUnxUIXK2vVEwCwksaFsw.png)

#### The complete code is available at [HERE](https://github.com/guillermo-musumeci/terraform-azure-github-actions-workflow)

---

If you find this article helpful then you can [**buy me a coffee**](https://www.buymeacoffee.com/harshhaareddy)**.**

### Follow for more stories like this 😊/ [**GitHub**](https://github.com/NotHarshhaa) / [**Hashnode**](https://hashnode.com/@prodevopsguy)
