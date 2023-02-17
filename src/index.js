import '@marcellejs/core/dist/marcelle.css';
import * as marcelle from '@marcellejs/core';

const myDashboard = marcelle.dashboard({
	title: 'My First Tutorial',
	author: 'Myself',
  });

const input = marcelle.webcam();

const featureExtractor = marcelle.mobileNet();

const label = marcelle.textInput();
label.title = 'Instance label';

const capture = marcelle.button('Click to record an instance');
capture.title = 'Capture instances to the training set';

const store = marcelle.dataStore('localStorage');
const trainingSet = marcelle.dataset('TrainingSet', store);

const trainingSetBrowser = marcelle.datasetBrowser(trainingSet);

const classifier = marcelle.mlpClassifier({ layers: [32, 32], epochs: 20 });
const trainingButton = marcelle.button('Train');

const plotTraining = marcelle.trainingPlot(classifier);

input.$images
	.filter(() => capture.$pressed.get())
  	.map(async (img) => ({
    	x: await featureExtractor.process(img),
    	thumbnail: input.$thumbnails.get(),
    	y: label.$value.get(),
  }))
  .awaitPromises()
  .subscribe(trainingSet.create);

label.$value.subscribe((currentInput) => {
console.log('currentInput:', currentInput);
});

const $instances = capture.$click
.sample(input.$images)
.map(async (img) => ({
x: await featureExtractor.process(img),
y: label.$value.get(),
thumbnail: input.$thumbnails.get(),
}))
.awaitPromises();

const $predictions = input.$images
  .map(async (img) => {
    const features = await featureExtractor.process(img);
    return classifier.predict(features);
  })
  .awaitPromises();

const predViz = marcelle.confidencePlot($predictions);

$predictions.subscribe(console.log);



trainingButton.$click.subscribe(() => {
	classifier.train(trainingSet);
});

$instances.subscribe(trainingSet.create);



myDashboard.page('Data Management')
	.sidebar(input, featureExtractor)
	.use([label, capture], trainingSetBrowser, trainingButton)
	.use(plotTraining);

myDashboard.page('Direct Evaluation').sidebar(input).use(predViz);

myDashboard.show();