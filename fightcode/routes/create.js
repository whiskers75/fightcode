var GithubApi, Robot, basePath, path, sequelize;

path = require('path');

basePath = path.join(process.env.CWD, 'fightcode');

sequelize = require(path.join(basePath, 'config', 'database'));

Robot = sequelize["import"](path.join(basePath, 'models', 'robot'));

GithubApi = require('github');

exports.createView = function(req, res) {
  if (!req.loggedIn) {
    return res.redirect('/auth/github');
  }
  return res.render('createRobot', {
    title: 'Create My Robot!',
    'roboCode': ''
  });
};

exports.create = function(req, res) {
  var github, robotData;
  if (!req.loggedIn) {
    return res.redirect('/auth/github');
  }
  github = new GithubApi({
    version: '3.0.0'
  });
  github.authenticate({
    type: 'oauth',
    token: req.user.token
  });
  robotData = {
    description: req.param('title'),
    "public": 'true',
    files: {
      'robot.js': {
        'content': req.param('code')
      }
    }
  };
  return github.gists.create(robotData, function(err, githubResponse) {
    return Robot.create({
      ownerLogin: req.user.login,
      gists: githubResponse.id,
      isPublic: true,
      title: req.param('title')
    }).success(function(user) {
      return res.redirect('/robots/update/' + githubResponse.id);
    });
  });
};

exports.updateView = function(req, res) {
  var github;
  if (!req.loggedIn) {
    return res.redirect('/auth/github');
  }
  github = new GithubApi({
    version: '3.0.0'
  });
  github.authenticate({
    type: 'oauth',
    token: req.user.token
  });
  return github.gists.get({
    id: req.params[0]
  }, function(err, githubResponse) {
    var files;
    files = Object.keys(githubResponse.files);
    return res.render('createRobot', {
      title: 'Update my robot',
      'roboCode': encodeURI(githubResponse.files[files[0]].content)
    });
  });
};

exports.update = function(req, res) {
  if (!req.loggedIn) {
    return res.redirect('/auth/github');
  }
};