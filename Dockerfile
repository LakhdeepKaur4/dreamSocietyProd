# base image
FROM node:10.16.0-alpine

# set working directory
WORKDIR /dreamSociety-BE/app

# Copy package.json
COPY package.json ./package.json

RUN npm cache clean --force
RUN npm cache verify

# install and cache app dependencies
RUN npm install

# Bundle app source
COPY . .

EXPOSE  8082

# CMD ["nginx"]

# start app
CMD ["npm", "start"]
