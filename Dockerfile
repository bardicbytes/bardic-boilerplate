FROM node 
WORKDIR /node-boilerplate 
COPY package.json . 
RUN npm install 
COPY . . 
EXPOSE 443
EXPOSE 53847 
CMD npm start
