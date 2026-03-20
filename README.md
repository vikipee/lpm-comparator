# LPM Comparator

<img src="./images/logo.png" alt="Logo" width="200" />

LPM Comparator is a tool for comparing two sets of local process models. Local process models are process models 
that describe fragments of a process, and usually they go in sets. However, this makes them challenging to evaluate 
since one model might be better than another and also in different dimensions.

The tool tries to fill that gap by offering various measures on model but also on set level.


## Usage
Run `docker compose up` and access the tool via http://localhost:5173/.

The repo already contains an example event log with two small sets of local process models and pre-generated 
comparison report for ease of use.

## Application UI

### Overview
![Overview](images/overview.png)

### Preferential Comparison
![Preferential Comparison](images/preferential-comparison.png)

### Neutral Comparison
![Set Relation](images/set-relation.png)

![Model Coverage](images/model-level-coverage.png)

### Model Evaluation
![Model Descriptors](images/model-level-descriptors.png)

