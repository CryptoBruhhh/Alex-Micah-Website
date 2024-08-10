URL:
http://localhost:3000/

//rebuild (FROM DOCKERFILE)
docker build -t new-image-name:tag .

run docker app (DB and APP)
docker-compose up

REBUILD BEFORE RUNNING AGAIN WITH CHANGES:
docker-compose up --build

close dowcker app 
docker-compose down

How to SSH to EC2 Server on AWS (LOGIN)
ssh -i "C:\Users\xettm\Desktop\websitefolderstuff\Keypairtest1.pem" ubuntu@ec2-52-65-116-190.ap-southeast-2.compute.amazonaws.com

COPY IMAGE
(scp -i <path to key> <path to image.tar> <user@aws.com>)
scp -i C:\Users\xettm\Desktop\websitefolderstuff\Keypairtest1.pem C:\Users\xettm\Desktop\Website\website-image-test.tar ubuntu@ec2-52-65-116-190.ap-southeast-2.compute.amazonaws.com


RANDOM NOTES FOR UPDATING AWS:

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

3. install docker

4. build docker image

5. run docker image