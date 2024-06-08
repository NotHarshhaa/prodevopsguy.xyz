---
author: ProDevOpsGuy Team
pubDatetime: 2024-06-08T11:13:20Z
title: Blue-Green Deployments with Kubernetes
slug: blue-green-deployments-with-kubernetes
ogImage: "/assets/blue-green-deploy-banner.png"
featured: false
draft: false
tags:
  - kubernetes
  - devops
  - deployment
  - ci-cd
description: In this blog, we will discuss how Blue-Green Deployments can be implemented using Kubernetes, one of the most popular container orchestration platforms.
---

![](https://imgur.com/rR0pkcT.png)

### In this blog, we will discuss how Blue-Green Deployments can be implemented using Kubernetes, one of the most popular container orchestration platforms

We will cover the steps involved in setting up a **Blue-Green Deployment in Kubernetes**, along with the benefits of using this strategy.

## **What are Blue-Green Deployments**

![](https://miro.medium.com/v2/resize:fit:802/0*MmWUbRJq8hgXUfbf.jpeg)

A **Blue-Green Deployment** is a deployment strategy where two identical environments, the “blue” environment and the “green” environment, are set up. The blue environment is the production environment, where the live version of the application is currently running, and the green environment is the non-production environment, where new versions of the application are deployed.

When a new version of the application is ready to be deployed, it is deployed to the green environment. Once the new version is deployed and tested, traffic is switched to the green environment, making it the new production environment. The blue environment then becomes the non-production environment, where future versions of the application can be deployed.

## **Setting up Blue-Green Deployments in Kubernetes**

![](https://miro.medium.com/v2/resize:fit:626/0*iUm6lC23pt8MBga3.png)

The following are the steps involved in setting up Blue-Green Deployments in Kubernetes:

## **Step 1: Create the Blue Deployment**

The first step in setting up a Blue-Green Deployment is to create the blue deployment. To create the blue deployment, use the following YAML code:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      env: blue
  template:
    metadata:
      labels:
        app: myapp
        env: blue
    spec:
      containers:
        - name: myapp
          image: myapp:1.0
          ports:
            - containerPort: 80
```

This YAML code creates a deployment with three replicas that selects the blue environment and uses the myapp:1.0 image.

## **Step 2: Create the Blue Service**

The second step is to create the blue service. To create the blue service, use the following YAML code:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: blue
spec:
  selector:
    app: myapp
    env: blue
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

This YAML code creates a service that selects the blue environment and maps traffic from port 80 to the target port 80 of the blue deployment.

## **Step 3: Verify the Blue Deployment**

The third step is to verify that the blue deployment is working correctly. To do this, use the following command:

```bash
kubectl get pods -l app=myapp,env=blue
```

This command should return the three replicas of the blue deployment.

## **Step 4: Create the Green Deployment**

The fourth step is to create the green deployment. To create the green deployment, use the following YAML code:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: green
spec:
  replicas: 0
  selector:
    matchLabels:
      app: myapp
      env: green
  template:
    metadata:
      labels:
        app: myapp
        env: green
    spec:
      containers:
        - name: myapp
          image: myapp:2.0
          ports:
            - containerPort: 80
```

This YAML code creates a deployment with zero replicas that selects the green environment and uses the myapp:2.0 image.

Note that the replicas are set to zero because we don’t want traffic to be routed to the green deployment yet.

## **Step 5: Create the Green Service**

The fifth step is to create the green service. To create the green service, use the following YAML code:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: green
spec:
  selector:
    app: myapp
    env: green
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

This YAML code creates a service that selects the green environment and maps traffic from port 80 to the target port 80 of the green deployment.

## **Step 6: Verify the Green Deployment**

The sixth step is to verify that the green deployment is working correctly. To do this, use the following command:

```bash
kubectl get pods -l app=myapp,env=green
```

This command should return zero replicas, as we have not yet scaled the green deployment.

## **Step 7: Scale the Green Deployment**

The seventh step is to scale the green deployment. To scale the green deployment, use the following command:

```bash
kubectl scale deployment green --replicas=3
```

This command scales the green deployment to three replicas.

## **Step 8: Verify Traffic Routing**

The eighth step is to verify that traffic is correctly routed to the blue deployment. To do this, use the following command:

```bash
kubectl describe service blue | grep Endpoints
```

This command should return the IP addresses of the three replicas of the blue deployment.

## **Step 9: Switch Traffic to the Green Deployment**

The ninth step is to switch traffic to the green deployment. To do this, use the following command:

```bash
kubectl apply -f green-service.yaml
```

This command applies the green service YAML code, which maps traffic to the green deployment.

## **Step 10: Verify Traffic Routing**

The final step is to verify that traffic is correctly routed to the green deployment. To do this, use the following command:

```bash
kubectl describe service green | grep Endpoints
```

This command should return the IP addresses of the three replicas of the green deployment.

## **Benefits of Blue-Green Deployments**

1. **Zero Downtime:** Blue-Green Deployments allow new versions of applications to be deployed with zero downtime, as traffic is switched from the blue environment to the green environment seamlessly.
2. **Easy Rollback:** If a new version of the application has issues, rolling back to the previous version is easy, as the blue environment is still available.
3. **Reduced Risk:** By using Blue-Green Deployments, the risk of deploying new versions of applications is reduced significantly. This is because the new version can be deployed and tested in the green environment before traffic is switched over from the blue environment. This allows for thorough testing and reduces the chance of issues arising in production.
4. **Increased Reliability:** By using Blue-Green Deployments, the reliability of the application is increased. This is because the blue environment is always available, and any issues with the green environment can be quickly identified and resolved without affecting users.
5. **Flexibility:** Blue-Green Deployments provide flexibility in the deployment process. Multiple versions of an application can be deployed side-by-side, allowing for easy testing and experimentation.

## **Conclusion :-**

_In conclusion, **Blue-Green Deployments** are an effective deployment strategy that can be used to deploy new versions of applications with zero downtime and reduced risk. By deploying new versions of applications in a separate environment and switching traffic seamlessly, the risk of issues arising in production is significantly reduced. This allows for thorough testing and experimentation, increased reliability, and flexibility in the deployment process. Kubernetes provides a powerful platform for implementing **Blue-Green Deployments**, and with the steps outlined in this article, deploying applications with this strategy can be achieved easily and efficiently._

**_Thank you for reading my blog …:)_**

## Author by

![](https://imgur.com/2j6Aoyl.png)

> Join Our [Telegram Community](https://t.me/prodevopsguy) || [Follow me](https://github.com/NotHarshhaa) for more DevOps Content.
