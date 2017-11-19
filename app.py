from flask import Flask
from flask import request
from sklearn.ensemble import RandomForestClassifier
import numpy as np
import pandas as pd
import os

APP_ROOT = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)

@app.route('/check', methods=['GET', 'POST'])
def check_phishing():
    real_data = request.args.to_dicts()
    dataframe = pd.read_csv(APP_ROOT + '/datasets/training_dataset.csv')
    columns = list(filter(lambda x: 'Unnamed' not in x, dataframe.columns))
    df = dataframe[columns]
    df['is_train'] = np.random.uniform(0, 1, len(df)) <= .75
    train, test = df[df['is_train']==True], df[df['is_train']==False]
    features = columns[:30]
    data = test[0:1][features]
    y = pd.factorize(train['Result'])[0]
    clf = RandomForestClassifier(n_jobs=2, random_state=0)
    clf.fit(train[features], y)
    predict = clf.predict(data)
    return str(predict[0])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
