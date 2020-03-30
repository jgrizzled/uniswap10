// global test imports

import chai from 'chai';
const { expect } = chai;
global.expect = expect;

import supertest from 'supertest';
global.supertest = supertest;

import Postgrator from 'postgrator';
global.Postgrator = Postgrator;
