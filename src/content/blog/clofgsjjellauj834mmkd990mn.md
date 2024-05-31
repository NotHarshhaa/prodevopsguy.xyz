---
author: ProDevOpsGuy Team
pubDatetime: 2024-05-30T11:45:11Z
title: AWS with Terraform and Jenkins Pipeline
slug: aws-with-terraform-and-jenkins-pipeline
ogImage: https://cdn.hashnode.com/res/hashnode/image/upload/v1717136641997/d02bcaf8-8665-4321-b437-715824a9272b.png
featured: true
draft: false
tags:
  - aws
  - jenkins
  - devops
  - terraform
  - ci-cd
description: In this article, I will explain how to create and manage the public and private subnets using terraform and create instance in the desired subnet.
---

![TEXT](https://imgur.com/09tzJtI.png)

# **What is Terraform?**

**Terraform** is an **open-source infrastructure as code (IAC)** platform for building, managing, and deploying production-ready environments. Terraform uses declarative configuration files to codify cloud APIs. Terraform is capable of managing both third-party services and unique in-house solutions.

# **What is Jenkins?**

**Jenkins** is a **free and open-source continuous integration and delivery (CI/CD) automation server**. It aids in the automation of portions of the software development lifecycle, including as code development, testing, and deployment to numerous servers. **CI/CD** is a means of delivering apps to clients more often by incorporating automation into the app development process. CI/CD, in particular, adds continuous automation and monitoring across the app lifecycle, from integration and testing through delivery and deployment. Continuous Integration works by submitting tiny code chunks to your application’s codebase, which is maintained in a Git repository, and running a pipeline of scripts to build, test, and validate the code changes before merging them into the main branch.

# **What is Subnet?**

A logical subdivision of an IP network is referred to as a subnet. Subnetting is the process of separating a network into two or more networks. The host component is identified by one part, while the network part is identified by the other.

## **Types of subnet:**

- **Public Subnet:** A public subnet is one that has a route to an internet gateway and is associated with the Route table. This establishes a connection between the VPC and the internet as well as other AWS services. By default, an instance launched on the public subnet will be assigned an IP address.
- **Private Subnet:** Back-end servers in the private subnet often do not need to receive inbound traffic from the internet and hence do not have public IP addresses. They can, however, use the NAT gateway or NAT instance to transmit requests to the internet.

![](https://miro.medium.com/v2/resize:fit:802/1*7URlkXQCmtTYppt09ffzkQ.png)

## Source Code link: [HERE](https://github.com/NotHarshhaa/Jenkins-Terraform-AWS-Infra)

In this **article**, I will explain how to create and manage the public and private subnets using terraform and create instance in the desired subnet.

**Prerequisites**:

- Basic knowledge of AWS & Terraform
- AWS account
- AWS Access & Secret Key

## **Step 1:- Create a Provider**

Since we are going to use AWS as our cloud provider, we are going to use the aws terraform provider and use the aws access and secret key as a variable which will be passed from the Jenkinsfile.

**providers.tf**

```go
terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "3.70.0"
    }
  }
}provider "aws" {
    access_key = var.access_key
    secret_key = var.secret_key
    region     = var.region
}
```

## **Step 2:- Create a VPC**

**vpc.tf**

```go
resource "aws_vpc" "development-vpc" {
    cidr_block = var.cidr_blocks[0].cidr_block
    tags = {
        Name = "${lower(var.vendor)}-${lower(var.environment)}-vpc"
    }
}data "aws_vpc" "existing_vpc" {
    #"query existing resources"
    id = aws_vpc.development-vpc.id
}
```

## **Step 3:- Create Public and Private Subnet**

**subnets.tf**

```go
locals {
    availability_zones = "${var.region}a"
}resource "aws_subnet" "public-subnet-1" {
    vpc_id     = data.aws_vpc.existing_vpc.id
    cidr_block = var.cidr_blocks[1].cidr_block
    availability_zone = local.availability_zones
    tags = {
        Name = "${lower(var.vendor)}-${lower(var.environment)}-public-${local.availability_zones}"
    }
}resource "aws_subnet" "private-subnet-1" {
    vpc_id     = data.aws_vpc.existing_vpc.id
    cidr_block = var.cidr_blocks[2].cidr_block
    availability_zone = local.availability_zones
    tags = {
        Name = "${lower(var.vendor)}-${lower(var.environment)}-private-${local.availability_zones}"
    }
}
```

- This subnet will not serve as a public subnet until the internet gateway is created and the route table is updated

## **Step 4:- Create Internet and Nat Gateway**

**ig_natgw.tf**

```go
resource "aws_internet_gateway" "gw" {
  vpc_id = data.aws_vpc.existing_vpc.id
  tags = {
    Name = "${lower(var.vendor)}-${lower(var.environment)}-ig"
  }
}# CREATE ELASTIC IP WITH NAT GATEWAYresource "aws_eip" "lb" {
  depends_on    = [aws_internet_gateway.gw]
  vpc           = true
}resource "aws_nat_gateway" "natgw" {
  allocation_id = aws_eip.lb.id
  subnet_id     = aws_subnet.public-subnet-1.id
  depends_on = [aws_internet_gateway.gw]
  tags = {
    Name = "${lower(var.vendor)}-${lower(var.environment)}-nat-gw"
  }
}
```

## **Step 5:- Create a Route table for Public and Private Subnet**

**route-tables.tf**

```go
resource "aws_route_table" "route-table-public" {
  vpc_id = data.aws_vpc.existing_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
  tags = {
    Name = "${lower(var.vendor)}-${lower(var.environment)}-rt-public"
  }
}resource "aws_route_table" "route-table-private" {
  vpc_id = data.aws_vpc.existing_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_nat_gateway.natgw.id
  }
  tags = {
    Name = "${lower(var.vendor)}-${lower(var.environment)}-rt-private"
  }
  lifecycle {
    ignore_changes = [
      route,
    ]
  }
}resource "aws_route_table_association" "route-table-public-association-1" {
  subnet_id      = aws_subnet.public-subnet-1.id
  route_table_id = aws_route_table.route-table-public.id
}resource "aws_route_table_association" "route-table-private-association-1" {
  subnet_id      = aws_subnet.private-subnet-1.id
  route_table_id = aws_route_table.route-table-private.id
}
```

- I’ve built a route table and routed all requests to the 0.0.0.0/0 CIDR block in the code above.
- I am also attaching this route table to the public and private subnet created earlier.

## **Step 6:- Create Security Groups**

**security-groups.tf**

```go
resource "aws_security_group" "db-sg-grp" {
  name          = "${var.vendor}-${var.environment}-db-sg"
  description   = "Sg for DB"
  vpc_id        = data.aws_vpc.existing_vpc.idegress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["${aws_network_interface.private_network_interface.id}/32"]
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["${aws_network_interface.private_network_interface.id}/32"]
  }
}# CREATE SG FOR App
resource "aws_security_group" "app-sg-grp" {
  name          = "${var.vendor}-${var.environment}-app-sg"
  description   = "Sg for app"
  vpc_id        = data.aws_vpc.existing_vpc.idegress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0" ]
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0" ]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0" ]
  }
}
```

- I have opened 80,443 & 22 ports for the inbound connection and I have opened all the ports for the outbound connection for the application.
- Whereas I have opened 3306 port for the inbound connection to a specific IP that we have assigned for the EC2 instance and opened all the ports for the outbound connection for the database.

## **Step 7:- Create EC2 instances**

**ec2.tf**

```go
data "aws_ami" "latest_amazon_linux_img" {
  most_recent      = true
  owners           = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-gp2"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}resource "aws_network_interface" "private_network_interface" {
  subnet_id          = aws_subnet.public-subnet-1.id
  security_groups    = [aws_security_group.app-sg-grp.id]
  private_ips        = ["10.0.10.10"]
}resource "aws_instance" "app" {
    ami                       = data.aws_ami.latest_amazon_linux_img.id
    instance_type             = "t2.micro"
    root_block_device {
        volume_type         = "gp2"
        volume_size         = 30
    }
    associate_public_ip_address = true
    network_interface {
        network_interface_id = aws_network_interface.private_network_interface.id
        device_index = 0
    }
    key_name = "tests"
    tags = {
        Name = "${var.vendor}-${var.environment}-app"
    }
    lifecycle {
        ignore_changes = [
            ami,
        ]
    }
}resource "aws_network_interface" "network_interface" {
  subnet_id          = aws_subnet.private-subnet-1.id
  security_groups    = [aws_security_group.db-sg-grp.id]
  private_ips        = ["10.0.110.10"]
}resource "aws_instance" "db" {
    ami                       = data.aws_ami.latest_amazon_linux_img.id
    instance_type             = "t2.micro"
    root_block_device {
        volume_type         = "gp2"
        volume_size         = 50
    }
    network_interface {
        network_interface_id = aws_network_interface.network_interface.id
        device_index = 0
    }
    key_name = "tests"
    tags = {
        Name = "${var.vendor}-${var.environment}-db"
    }
    lifecycle {
        ignore_changes = [
            ami,
        ]
    }
}
```

## **Step 8:- Create Variables**

**variables.tf**

```go
variable "vendor" {
    type = string
}
variable "environment" {
    type = string
}
variable "region" {
    type = string
    default = "us-west-2"
}
variable "access_key" {
    type = string
}
variable "secret_key" {
    type = string
}variable "cidr_blocks" {
    description = "VPC CIDR BLOCK"
    type = list(object({
        cidr_block = string
    }))
}
```

- We have created another variable file where we can pass the customized value in the following format.

## **Step 9:- Create tfvariables**

**terraform-dev.tfvars**

This is the file which we can edit and change the values to the desired value.

```go
vendor = "example"environment = "dev"cidr_blocks=[{cidr_block = "10.0.0.0/16"},{cidr_block = "10.0.10.0/24"},{cidr_block = "10.0.110.0/24"}]
```

Finally we will need the output of the Public IP for the application instance which can be gathered from the below code.

## **Step 10:- Create output**

**output.tf**

```go
output "ec2-app-public-ip" {
    value = aws_instance.app.public_ip
}
```

This will give us the public ip of our EC2 instance.

## **Step 11:- Create Jenkinsfile**

So, now our entire code is ready. We need to run the below steps to create infrastructure.  
Create a `Jenkinsfile` and add the following code.

```go
pipeline {
    agent any
    parameters {
        string(name: 'AWS_ACCESS_KEY_ID', defaultValue: '', description: 'AWS Access Key ID')
        string(name: 'AWS_SECRET_ACCESS_KEY', defaultValue: '', description: 'AWS Secret Access Key')
        string(name: 'AWS_REGION', defaultValue: 'us-west-2', description: 'AWS Region')
    }
    environment {
        access_key = "${params.AWS_ACCESS_KEY_ID}"
        secret_key = "${params.AWS_SECRET_ACCESS_KEY}"
        region = "${params.AWS_REGION}"
    }
    stages {
        stage ('Terraform Init') {
            steps {
                sh """
                export TF_VAR_region='${env.region}'
                export TF_VAR_access_key='${env.access_key}'
                export TF_VAR_secret_key='${env.secret_key}'
                terraform init
                """
            }
        }
        stage ('Terraform Plan') {
            steps {
                sh """
                export TF_VAR_region='${env.region}'
                export TF_VAR_access_key='${env.access_key}'
                export TF_VAR_secret_key='${env.secret_key}'
                terraform plan -var-file=terraform-dev.tfvars
                """
            }
        }
        stage ('Terraform Apply') {
            steps {
                sh """
                export TF_VAR_region='${env.region}'
                export TF_VAR_access_key='${env.access_key}'
                export TF_VAR_secret_key='${env.secret_key}'
                terraform apply -var-file=terraform-dev.tfvars -auto-approve
                """
            }
        }
    }
}
```

- Terraform init initializes the working directory and downloads plugins of the provider
- Terraform plan is to create the execution plan for our code.
- Terraform apply is to create the actual infrastructure. It will ask you to provide the Access Key and Secret Key in order to create the infrastructure. So, instead of hardcoding the Access Key and Secret Key, it is better to apply at the run time.

# **Step 12:- Verify The Resources**

Terraform will create below resources:

- Provider Initialization
- VPC
- Public and Private Subnet for EC2 instance
- Internet And NAT Gateway
- Route table for Public & Private Subnets
- Security Groups
- EC2 instances
- Variables
- Outputs

## Author by:

![](https://imgur.com/2j6Aoyl.png)

> [!Note]
> Join Our [Telegram Community](https:t.me/prodevopsguy) || [Follow me](https://github.com/NotHarshhaa) for more DevOps Content
