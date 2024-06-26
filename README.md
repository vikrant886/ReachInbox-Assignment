## ReachInbox Assignment
Task : Aims to build a tool that will parse and check the emails in a Google and Outlook email ID, and
respond to the e-mails based on the context using AI.

Features in this project includes :

1. oauth access to Gmail
2. oauth access to Outlook
3. Understand context of the emails using OpenAI/LLM's
4. Assign Automatic labels (Interested, Not Interested, More Info required)
5. Based of the context email, send automated replies using OpenAI

![download](https://raw.githubusercontent.com/vikrant886/ReachInbox-Assignment/main/frontend/src/images/image.png)
# technologies used:
- Node.js
- Express.js
- OpenAI
- Google APIs
- Microsoft Graph API
# npm packages used
- dotenv
- Axios
- bullMQ
- google-auth-library
- ioredis
- @microsoft/microsoft-graph-client
- @azure/msal-node

<br>

## Installation setup
1. Clone the repository to your local machine
```bash
git clone https://github.com/shraddha-gawde/reachInbox-assignment.git
```
2. Navigate to the root directory of the project directory :
```bash 
cd server
```
3. Run `npm install` to install all the dependencies
4. Create a `.env` file in the root directory with the same IDs as specified in the documentation.

## Running the server
1. To start the server, run the following command in your terminal
```bash
npm start
```
*This will start the server at localhost:8000 (or whatever port you have specified).*
or we can use backend deployed link also.

2. To start the worker.js file, run the following command in your terminal
```bash
npm run dev
```
![download](https://raw.githubusercontent.com/vikrant886/ReachInbox-Assignment/main/frontend/src/images/Screenshot%202024-06-26%20204748.png)
![download](https://raw.githubusercontent.com/vikrant886/ReachInbox-Assignment/main/frontend/src/images/Screenshot%202024-06-26%20204943.png)
![download](https://raw.githubusercontent.com/vikrant886/ReachInbox-Assignment/main/frontend/src/images/Screenshot%202024-06-26%20205038.png)
