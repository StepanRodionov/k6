include .env

build_demo:
	xk6 build --with xk6-demo="${PROJECT_ROOT}/plugins/demo"