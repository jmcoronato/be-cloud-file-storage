# Cloud File Storage
Cloud File Storage is a BE service that accepts file uploads from users and allows them to store and
share files securely in the cloud. It provides an abstraction between two
different cloud storage providers, Box and Dropbox. If one of the services goes down, the service
can quickly failover to a different provider without affecting the costumers.
