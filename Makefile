include .env

build_demo:
	xk6 build latest \
		   	  --with xk6-demo="${PROJECT_ROOT}/plugins/demo" \
			  --with github.com/grafana/xk6-sql@v0.0.1
run_demo:
	./k6 run tests/example.js