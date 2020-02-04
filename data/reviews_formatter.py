import pandas as pd

df = pd.read_csv('reviews.csv')
df = df.drop(['index', 'username', 'text'], axis=1)
df.to_csv(r'new_reviews.csv')