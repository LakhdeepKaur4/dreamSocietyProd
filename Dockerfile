# base image
FROM node:10.16.0-alpine

# set working directory
WORKDIR /dreamSociety-BE/app

# Copy package.json
COPY package.json ./package.json

# install and cache app dependencies
RUN npm install

# Bundle app source
COPY . .

# start app
CMD ["npm", "start"]
