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
