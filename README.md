# qryq server

A server for [qryq](https://github.com/bguiz/qryq)

## Purpose

Many who have watched me give a talk on qryq [(slide deck here)](http://bguiz.github.io/qryq/), have asked, "so, how do I actually start using thsi library?"

My answer to that would be that it is a general purpose library, just follow the instruction on the main `README.md` on the qryq page, and use its unit tests as a reference for how to put it all together.

## Make it even easier

Each time though, I thought, perhaps I could do one better than that. [Greg](https://github.com/gregory144) suggested that I create a sample server that exposed a qryq end point.

Well here it is!

## How to use this project

Do **not** git clone this project, unless of course you are actually contributing to this project.

What you will want to do instead is [download a copy of qryq-server](https://github.com/bguiz/qryq-server/archive/master.zip), and then copy its extracted contents into your own project.

	cd path/to/your/project
	wget https://github.com/bguiz/qryq-server/archive/master.zip
	unzip master.zip
	mv qryq-server-master/* .
	rm -r master.zip qryq-server-master

Next modify `api.js` to include the functions you want to expose via a `qryq` endpoint, and run the server

	#edit api.js
	node server.js

## Testing that it works

Test that serving static files works:

	curl -i -X GET http://localhost:9999/static/index.html

Test that non-qryq end point works:

	curl -i -X GET http://localhost:9999/hello

Test that qryq end point works:

	curl -i -X POST \
	-d '[
	{"id": "A", "api": "add", "qry":{"a":3, "b":4}},
	{"id": "B", "api": "multiply", "qry":{"a":"#{A}", "b":3}},
	{"id": "C", "api": "multiply", "qry":{"a":7, "b": "#{A}"}},
	{"id": "D", "api": "add", "qry":{"a":"#{C}", "b":"#{B}"}}
	]' \
	http://localhost:9999/api/v1/qryq

----

&copy; [Brendan Graetz](http://bguiz.com) 2013

GPL v3
