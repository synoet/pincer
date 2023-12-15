## Davinci Webtop ##

# Image variables
IMAGE_REGISTRY ?= registry.digitalocean.com/anubis
IMAGE_NAME ?= webtop-davinci
IMAGE := $(IMAGE_REGISTRY)/$(IMAGE_NAME)

# Debug variables
WEBTOP_PORT ?= 5000

help:
	@echo 'For convenience'
	@echo
	@echo 'Available make targets:'
	@grep PHONY: Makefile | cut -d: -f2 | sed '1d;s/^/make/'

.PHONY: build    # Build image
build:
	docker build -t $(IMAGE) .

.PHONY: push     # Push image to registry
push:
	docker push $(IMAGE)

.PHONY: debug    # Run container locally for debugging
debug:
	docker run -it --rm \
		-v $(shell pwd):/home/anubis \
		-p $(WEBTOP_PORT):$(WEBTOP_PORT) \
		$(IMAGE)
