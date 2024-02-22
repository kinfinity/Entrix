FROM public.ecr.aws/lambda/python:3.12
ARG LAMBDA_NAME

# Copy, Set working Dir
WORKDIR /var/task/app
COPY /${LAMBDA_NAME}/pyproject.toml /${LAMBDA_NAME}/poetry.lock  /var/task/app/

# Copy the entire application code to the container
COPY /${LAMBDA_NAME}/. ./

# Install poetry and project dependencies
RUN pip install --upgrade pip && \
    pip install poetry && \
    chmod +x ./* && \
    poetry config virtualenvs.create false && \
    poetry config virtualenvs.in-project true && \
    poetry install --no-dev

# Handler
CMD ["poetry","run" , "lambda"]
