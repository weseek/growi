#!/usr/bin/env node
import { CliCore } from '@tsed/cli-core';
import { GenerateSwaggerCmd } from '@tsed/cli-generate-swagger';

import Server from '../server';

CliCore.bootstrap({
  server: Server,
  commands: [GenerateSwaggerCmd],
});
