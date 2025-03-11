FROM continuumio/miniconda3

WORKDIR /flask-server

RUN apt-get update && \
    apt-get install -y graphviz && \
    rm -rf /var/lib/apt/lists/*

# Copy the environment file into the container at /app/environment.yml
COPY environment.yml .

# Create the conda environment from the yml file and activate it (use && for chaining commands)
RUN conda env create -f environment.yml && \
    conda clean -afy

# Activate the environment by default when running containers (replace 'myenv' with your env name)
SHELL ["conda", "run", "-n", "pm4py_env", "/bin/bash", "-c"]

# Copy your application code into the container at /app
COPY . .

EXPOSE 5000

CMD ["conda", "run", "-n", "pm4py_env", "python", "server.py"]