URL (If run locally)
http://localhost:3000/

discard all changes b4 commit:
git reset --hard HEAD

//rebuild (FROM DOCKERFILE)
docker build -t new-image-name:tag .

//rebuild from ubunto
sudo docker build -t remote-image:remote-image-tag .

REBUILD BEFORE RUNNING AGAIN WITH CHANGES:
docker-compose up --build

enter docker container:
docker exec -it mongodb bash

How to SSH to EC2 Server on AWS (LOGIN)
ssh -i "C:\Users\xettm\Desktop\websitefolderstuff\Keypairtest1.pem" ubuntu@ec2-3-25-127-158.ap-southeast-2.compute.amazonaws.com

COPY IMAGE
(scp -i <path to key> <path to image.tar> <user@aws.com>)
scp -i C:\Users\xettm\Desktop\websitefolderstuff\Keypairtest1.pem C:\Users\xettm\Desktop\Website\website-image-test.tar ubuntu@ec2-52-65-116-190.ap-southeast-2.compute.amazonaws.com

RANDOM NOTES FOR UPDATING AWS:
1. rm -rf Alex-Micah-Website
2. sudo stop docker <containers "NAMES">
3. sudo docker rmi $(sudo docker images -a -q)
4. git clone https://github.com/xetters/Alex-Micah-Website.git
5. cd Alex-Micah-Website
6. sudo docker-compose up




When updating image for server:
Pull new image from docker hub:
Docker pull <username>/<repo name>:<tag>
docker pull xetters/website-image-test:updated-tag

Find any running docker containers (docker ps) and stop:
docker stop <docker container name>

Delete old container:
Docker rm <container name>

Run new docker image:
docker run -d -p 80:3000 xetters/website-image-test:updated-tag

#Steps for server:
1. install git

2. clone repo

"https://github.com/xetters/Alex-Micah-Website/tree/Micahs-Version"
git clone https://github.com/xetters/Alex-Micah-Website.git

3. install docker (and maybe python/pip etc)

4. build docker image

5. run docker image
sudo docker-compose up (compose also needs installation (CORRECT INSTALLATION, VERSION ERRORS CAN HAPPEN))

6. ensure security settings allow port inbound traffic (80http and 3000)

current website:
http://3.25.127.158:3000/
