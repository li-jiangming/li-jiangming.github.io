---
layout: post
title: Ubuntu20安装配置k8s和containerd
category: Tool
tags: DevOps k8s ubuntu20 containerd
---

本文是本人观看B站视频[K8s从入门到实战][bilibili-video-link]的记录和总结。

配置k8s阿里云源，并安装基础软件环境

```shell
apt-get update && apt-get install -y apt-transport-https
curl -fsSL https://mirrors.aliyun.com/kubernetes-new/core/stable/v1.30/deb/Release.key | \
    gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] \
    https://mirrors.aliyun.com/kubernetes-new/core/stable/v1.30/deb/ /" | \
    tee /etc/apt/sources.list.d/kubernetes.list
apt-get update && apt-get install -y kubelet kubeadm kubectl containerd
```

containerd配置

```shell
mkdir /etc/containerd // 创建containerd配置路径，默认无此目录
containerd config default | tee /etc/containerd/config.toml //创建并写入默认配置文件
sed -i 's#registry.k8s.io/pause:3.8#registry.aliyuncs.com/google_containers/pause:3.9#g' \
    /etc/containerd/config.toml
sed -i 's#SystemdCgroup = false#SystemdCgroup = true#g' /etc/containerd/config.toml
systemctl restart containerd // 重启服务
```

containerd拉取镜像

```shell
ctr -n=k8s.io i pull registry.aliyuncs.com/google_containers/coredns:v1.11.1
ctr -n=k8s.io i pull registry.aliyuncs.com/google_containers/kube-apiserver:v1.30.0
ctr -n=k8s.io i pull registry.aliyuncs.com/google_containers/kube-controller-manager:v1.30.0
ctr -n=k8s.io i pull registry.aliyuncs.com/google_containers/kube-scheduler:v1.30.0
ctr -n=k8s.io i pull registry.aliyuncs.com/google_containers/kube-proxy:v1.30.0
ctr -n=k8s.io i pull registry.aliyuncs.com/google_containers/pause:3.9
ctr -n=k8s.io i pull registry.aliyuncs.com/google_containers/etcd:3.5.12-0
ctr -n k8s.io i pull daocloud.io/nginx:latest // 后面测试使用，非k8s系统组建
```

containerd镜像管理

```shell
ctr -n k8s.io i ls/ctr -n k8s.io images ls // 查看namespace[k8s.io]中的镜像列表
ctr plugin ls // 查看插件列表
ctr namespace ls/ctr ns ls // 查看namespace列表
ctr -n k8s.io images list // 查看namespace为k8s.io中的镜像列表
ctr -n k8s.io images rm abc // 移除namespace为k8s.io中的ref为abc的镜像
ctr images rm abc // 默认namespace为default,移除ref为abc的镜像
```

k8s初始化

```shell
sysctl -w net.ipv4.ip_forward=1
swapoff -a // 关闭交换分区
kubeadm init \
  --apiserver-advertise-address=主机IP \
  --image-repository registry.aliyuncs.com/google_containers \
  --kubernetes-version v1.30.0 \
  --service-cidr=10.96.0.0/12 \
  --pod-network-cidr=10.244.0.0/16 \
  --ignore-preflight-errors=all

// 若失败，reset后重试
kubeadm reset -f

// 记录kubeadm join命令，或后面重新生成
openssl x509 -pubkey -in /etc/kubernetes/pki/ca.crt | \
    openssl rsa -pubin -outform der 2>/dev/null | \
    openssl dgst -sha256 -hex | sed 's/^.* //' // 获取cert
kubeadm token create --print-join-command --ttl 0 // 创建并打印join命令，永不过期(ttl=0)
kubeadm init phase upload-certs --experimental-upload-certs // 重新生成certificate-key

mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config
export KUBECONFIG=/etc/kubernetes/admin.conf

// 下载文件https://calico-v3-25.netlify.app/archive/v3.25/manifests/calico.yaml
sed -i 's?docker.io?docker.m.daocloud.io?g' calico.yaml // calico.yaml修改镜像拉取地址
kubectl apply -f calico.yaml
```

节点查看和删除

```shell
kubectl get node
kubectl drain <node-name> --delete-emptydir-data --force --ignore-daemonsets
kubectl delete node <node-name>
```

Pod相关

```shell
kubectl get pod --all-namespaces/kubectl get pods -A // 获取所有namespace下的pod
kubectl get pod -n <namespace-name> // 获取指定命名空间的pod
kubectl get pod // 获取命名空间为default下的pod
kubectl get pod <pod-name> -o wide // 检查pod的状态，如pod的IP
kubectl describe pod <pod-name> -n <namespace-name> // 查看namespace下pod的详细信息
kubectl get pod --show-labels // 查看标签
kubectl label pod <pod-name> <label-name>="<label-value>" // 给pod打标签（键值对）
// 通过标签的查询满足条件的pod
kubectl get pod -l <label-name>="<label-value>" // 查询指定键值对标签的pod
kubectl get pod -l '<label-name> in (<label-value>,<label-value>)' // 条件或查询
kubectl get pod -l '<label-name> notin (<label-value>,<label-value>)' // 条件非查询
kubectl get pod -l <label-name>=<label-value>,<label-name>=<label-value> // 条件与查询
```

使用nginx服务测试

```shell
kubectl run nginx \
	--image=daocloud.io/nginx:latest \
	--image-pull-policy=IfNotPresent \ // IfNotPresent(优先从本地镜像中拉取)
                                       // Always(从远程拉取)、Never(不从远程拉取)
	--replicas=3 \ // 创建3个副本
	-env "xx=1" --env "yy=2" \ // 添加环境变量
	--labels="xx=1,yy=2" // 添加标签
	
kubectl exec -it nginx -- bash // 进入pod中
```

查询和删除污点

```shell
kubectl describe nodes k8s-master | grep Taint // 查询污点
// Taints:       node-role.kubernetes.io/control-plane:NoSchedule // 示例输出
kubectl taint nodes k8s-master node-role.kubernetes.io/control-plane:NoSchedule- // 删除污点
node/k8s-master untainted // 示例输出
kubectl describe nodes k8s-master | grep Taint // 再次查询污点，
Taints:       <none> // 示例输出
```

其它

```shell
kubectl get cs // 检查组件状态
journalctl -f -u xxx.service // 查看服务日志，containerd.service和kubelet.service
```

nginx-pod.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: daocloud.io/nginx:latest
    ports:
    - containerPort: 80
```



nginx-service.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx
spec:
  selector:
    name: nginx
  type: NodePort
  ports:
  - protocol: TCP
    port: 10008
    targetPort: 80
    nodePort: 30008
```

nginx-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-app
spec:
  selector:
    matchLabels:
      app: nginx
  replicas: 5
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: daocloud.io/nginx:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 80
```

pod-nginx-simple.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-nginx-simple
  labels:
    app: "simple-pod"
    tag: "1"
spec:
  containers:
  - name: pod-nginx-simple
    image: daocloud.io/nginx:latest
    imagePullPolicy: IfNotPresent
    resources:
      limits:
        cpu: 0.1
        memory: 100Mi
      requests:
        cpu: 0.1
        memory: 100Mi
    ports:
    - containerPort: 80
```

生命周期

pod-nginx-simple-lifecycle.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-nginx-simple-lifecycle
spec:
  containers:
  - name: pod-nginx-simple-lifecycle
    image: daocloud.io/nginx:latest
    imagePullPolicy: IfNotPresent
    resources:
      limits:
        cpu: 0.1
        memory: 100Mi
      requests:
        cpu: 0.1
        memory: 100Mi
    lifecycle:
      postStart:
        exec:
          command: ["/bin/sh", "-c", "echo postStart > /k8s.txt"]
      preStop:
        exec:
          command: ["/bin/sh", "-c", "echo preStop >> /k8s.txt;sleep 60;"]
    ports:
    - containerPort: 80
```

存活探针(执行指定命令判断)

pod-nginx-simple-liveness-exec.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-nginx-simple-liveness-exec
spec:
  containers:
  - name: pod-nginx-simple-liveness-exec
    image: daocloud.io/nginx:latest
    imagePullPolicy: IfNotPresent
    args:
    - /bin/sh
    - -c
    - touch /healthy; sleep 30; rm -f /healthy; sleep 60
    livenessProbe:
      exec:
        command:
        - cat
        - /healthy
      initialDelaySeconds: 5
      periodSeconds: 5
    ports:
    - containerPort: 80
```

存活探针(通过HTTP请求判断)

pod-nginx-simple-liveness-http.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-nginx-simple-liveness-http
spec:
  containers:
  - name: pod-nginx-simple-liveness-http
    image: daocloud.io/nginx:latest
    imagePullPolicy: IfNotPresent
    livenessProbe:
      httpGet:
        path: /index.html
        port: 80
        httpHeaders:
        - name: Custom-Header
          value: Amesome
      initialDelaySeconds: 5
      periodSeconds: 5
    ports:
    - containerPort: 80
```

就绪探针

pod-nginx-simple-readiness.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-nginx-simple-readiness
spec:
  containers:
  - name: pod-nginx-simple-readiness
    image: daocloud.io/nginx:latest
    imagePullPolicy: IfNotPresent
    readinessProbe:
      httpGet:
        path: /index.html
        port: 80
        httpHeaders:
        - name: Custom-Header
          value: Awesome
      initialDelaySeconds: 5
      periodSeconds: 5
    ports:
    - containerPort: 80
```

// 启动探针

pod-nginx-simple-startup.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-nginx-simple-startup
spec:
  containers:
  - name: pod-nginx-simple-startup
    image: daocloud.io/nginx:latest
    imagePullPolicy: IfNotPresent
    startupProbe:
      httpGet:
        path: /index.html
        port: 80
        httpHeaders:
        - name: Custom-Header
          value: Awesome
      initialDelaySeconds: 5
      periodSeconds: 5
    ports:
    - containerPort: 80
```

[bilibili-video-link]: https://www.bilibili.com/video/BV1hx4y1e7xX

