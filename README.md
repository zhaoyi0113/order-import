# order-import

## Description

This program read a csv file as inpurt and import the data into mongodb `orders` collection. Below is the csv file format:

```
orderId,customerId,item,quantity
sample-123,customer-321,Flowers,2
```
Each line represents an order data. It imports the order which customer ID existed in `customers` collection.

## Structure

The project is managed by `nodejs` and `yarn`. Below is the source code directory structure:

- config
	
	define environment related configration file for database connection

- data

	sample csv data file

- src

	the source code for this program

	- src/models

		The `MongoDB` connection is done through `mongoose` and collection model classes are defined in this directory.
	
	- src/db-writer

		this is the main logic for writing data into database and validation check. It extends from `Writable` class. The read stream will pipe the chunk of data into this `Writable` instance.

- test

	unit test data

# How to Build and Run

- Compile the program by `yarn install`

- Run the program by `yarn start`, it will load the data from `./data/orders.csv` file. If you want to load a different data file, please specify the command as: `yarn start -- DATA_PATH`.

- Run test cases by `yarn test`