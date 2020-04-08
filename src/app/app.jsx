import { h, render, Component } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import finder from '@medv/finder';
import _ from 'lodash';
import $ from 'jquery';
import { Observable } from 'rxjs';

import { useWindowEvent } from './utils/hooks';
import Transformers from './utils/transformers';
import Templates from './utils/templates';

const BASE_CLASS = 'rym__';
const HOVER_CLASS = `${BASE_CLASS}hover`;

const fields = [
	{
	  name: 'artist',
	  promptLabel: 'artist',
	  formLabel: 'artist',
	  transformer: Transformers.capitalizationTransformer,
	},
	{
	  name: 'title',
	  promptLabel: 'title',
	  formLabel: 'title',
	  transformer: Transformers.capitalizationTransformer,
	},
	{
	  name: 'releaseType',
	  promptLabel: 'release type',
	  formLabel: 'type',
	},
	{
	  name: 'date',
	  promptLabel: 'release date',
	  formLabel: 'date',
	  transformer: Transformers.dateTransformer,
	},
	{
	  name: 'label',
	  promptLabel: 'label',
	  formLabel: 'label',
	},
	{
	  name: 'catalogId',
	  promptLabel: 'catalog #',
	  formLabel: 'catalog #',
	},
	{
	  name: 'country',
	  promptLabel: 'country',
	  formLabel: 'country',
	},
	{
	  name: 'trackNumber',
	  promptLabel: 'a track number',
	},
	{
	  name: 'trackTitle',
	  promptLabel: 'a track title',
	  transformer: Transformers.capitalizationTransformer,
	},
	{
	  name: 'trackTime',
	  promptLabel: 'a track time',
	  transformer: Transformers.timeTransformer,
	},
];

const App = () => {
	const [isFormDisplayed, setIsFormDisplayed] = useState(false);
	const [isSelecting, setIsSelecting] = useState(false);
	const [cssData, setCssData] = useState({});
	const [formData, setFormData] = useState({});

	let updateSelectedElm;
	const selectedElmObservable = Observable.create((observer) => {
		updateSelectedElm = (value) => {
		  observer.next(value);
		};
	});

	useWindowEvent('mouseover', _.throttle((e) => {
		if (isSelecting
		  && e.srcElement
		  && e.srcElement.classList
		  && !e.srcElement.classList.contains(BASE_CLASS)) {
		  e.srcElement.classList.add(HOVER_CLASS);
		}}, 200));

	useWindowEvent('mouseout', (e) => {
		e.srcElement.classList.remove(HOVER_CLASS);
	});

	useWindowEvent('click', (e) => {
		e.preventDefault();

		if (e.srcElement.classList.contains(HOVER_CLASS)) {
		  updateSelectedElm(e.target);
		}
  
		return false;
	});

	return (
		isFormDisplayed && (
		<>
			<div id="rym__form" className="rym__" style="top: 0; right: 0">
				<div id="rym__form-inner">
				<h1 id="rym__header">RYM Add Helper</h1>
				<h4>RYM Artist ID:</h4>
				<input type="text" id="rym__artistid" />
				<br />
				<h4>Data:</h4>
				<ul id="rym__data" />
				<button id="rym__submit" type="button">Submit</button>
				</div>
			</div>
			<div id="rym__prompt-contaner">
				<p id="rym__prompt" />
			</div>
		</>	
		)
	)
}

export default App;