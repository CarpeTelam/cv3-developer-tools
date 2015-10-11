#!/usr/bin/env node

'use strict';

const del = require('del');
const moment = require('moment');

const timestamp = moment().unix();

del(['./process/store/*.zip', './process/bootstrap/bootstrap/', './process/bootstrap/*.zip', '**/.DS_Store']);
