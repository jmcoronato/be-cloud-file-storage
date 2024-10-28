# Cloud File Storage


# Cloud File Storage API

Cloud File Storage is a BE service that accepts file uploads from users and allows them to store and
share files securely in the cloud. It provides an abstraction between two
different cloud storage providers, Box and Dropbox. If one of the services goes down, the service
can quickly failover to a different provider without affecting the costumers.It uses JSON Web Tokens (JWT) for authentication and access control.

## Setup

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node's package manager)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/jmcoronato/be-cloud-file-storage.git
    ```

2. Install the required dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the root of the project with the following structure and fill in each environment variable:

    ```env
    JWT_SECRET=your_jwt_secret_key
    JWT_EXPIRES_IN=1h
    BOX_CLIENT_ID=your_box_client_id
    BOX_CLIENT_SECRET=your_box_client_secret
    BOX_ACCESS_TOKEN=your_box_access_token
    DROPBOX_ACCESS_TOKEN=your_dropbox_access_token
    ```

   - `JWT_SECRET`: Secret key for generating JSON Web Tokens.
   - `JWT_EXPIRES_IN`: Duration of the JWT token validity.
   - `BOX_CLIENT_ID` and `BOX_CLIENT_SECRET`: Credentials for your application in Box.
   - `BOX_ACCESS_TOKEN` and `DROPBOX_ACCESS_TOKEN`: Access tokens for operations on Box and Dropbox.

### Running the Program

Once the `.env` file is set up, you can start the program with the following command:

```bash
npm run dev

