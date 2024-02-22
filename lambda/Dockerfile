FROM public.ecr.aws/lambda/python:3.12
ARG LAMBDA_NAME

# Copy, Set working Dir
WORKDIR /var/task
COPY /${LAMBDA_NAME}/pyproject.toml /${LAMBDA_NAME}/poetry.lock  /app/

# Install poetry and project dependencies
RUN pip install poetry && poetry config virtualenvs.create false && poetry install --no-dev

# Copy the entire application code to the container
COPY . .

# Set the CMD to your Lambda handler (adjust as needed)
CMD ["poetry","run" , "lambda"]
