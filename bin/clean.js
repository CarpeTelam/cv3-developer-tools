#!/usr/bin/env node

'use strict';

const del = require('del');
const moment = require('moment');

const timestamp = moment().unix();

// TODO: add the ability to cleanup just bootstrap or full

del(['./extract/store/*.zip', './extract/bootstrap/bootstrap/', './extract/bootstrap/*.zip', '**/.DS_Store']);
