// @ts-check

/**
#################################### 필수 Variables ####################################
# GITLAB_PROJECT_TOKEN: gitlab 프로젝트 access token
########################################################################################
*/

const { writeFile } = require('node:fs/promises');
const { fetchMergeRequestLabelsByCommit } = require('./apis/gitlab-rest-api.cjs');
const { withScriptGroupLog } = require('./utils/log-decorator.cjs');
const { argv, getArgvOutputFilePath } = require('./utils/argv.cjs');

const {
  GITLAB_PROJECT_TOKEN,
  CI_PROJECT_ID,
  CI_COMMIT_SHA,
  CI_COMMIT_BRANCH,
} = process.env;

const WORKFLOW_DEPLOYS = Object.freeze({
  DEV: 'dev',
  STG: 'stg',
  PROD: 'prod',
});

const WORKFLOW_DEPLOY_BY_BRANCH = Object.freeze({
  develop: WORKFLOW_DEPLOYS.DEV,
  stage: WORKFLOW_DEPLOYS.STG,
  main: WORKFLOW_DEPLOYS.PROD,
  // for test
  'feature/deploy-setting': WORKFLOW_DEPLOYS.DEV,
});

withScriptGroupLog('.gitlab/scripts/workflow-initialize.cjs', async () => {
  const output = getArgvOutputFilePath('workflow-variables.env');

  console.log('env', { GITLAB_PROJECT_TOKEN, CI_PROJECT_ID, CI_COMMIT_SHA });
  console.log('argv', { output });

  const labels = await fetchMergeRequestLabelsByCommit({
    // @ts-ignore
    gitlabBaseUrl: argv('gitlab-base-url'),
    // @ts-ignore
    projectId: CI_PROJECT_ID,
    // @ts-ignore
    commitSha: CI_COMMIT_SHA,
    // @ts-ignore
    token: GITLAB_PROJECT_TOKEN,
  });

  // @ts-ignore
  const WORKFLOW_DEPLOY =
    WORKFLOW_DEPLOY_BY_BRANCH[CI_COMMIT_BRANCH ?? ''] ?? 'error';
  const data = `WORKFLOW_LABELS=${labels}\nWORKFLOW_DEPLOY=${WORKFLOW_DEPLOY}\nBRANCH=${CI_COMMIT_BRANCH}`;
  console.log(output, data);

  await writeFile(output, data, 'utf-8');
});
