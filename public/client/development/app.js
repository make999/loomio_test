angular.module('loomioApp', ['ngNewRouter', 'ui.bootstrap', 'pascalprecht.translate', 'ngSanitize', 'hc.marked', 'angularFileUpload', 'mentio', 'ngAnimate', 'angular-inview', 'ui.gravatar', 'duScroll', 'angular-clipboard', 'checklist-model', 'monospaced.elastic', 'angularMoment', 'offClick']).config(function($locationProvider, $translateProvider, markedProvider, $compileProvider, $animateProvider, renderProvider) {
  var locale;
  $animateProvider.classNameFilter(/\banimated\b/);
  markedProvider.setOptions({
    renderer: renderProvider.$get(0).createRenderer(),
    gfm: true,
    sanitize: true,
    breaks: true
  });
  $locationProvider.html5Mode(true);
  if (window.Loomio != null) {
    locale = window.Loomio.currentUserLocale;
    $translateProvider.useUrlLoader("/api/v1/translations").preferredLanguage(locale);
    $translateProvider.useSanitizeValueStrategy('escapeParameters');
  }
  if ((window.Loomio != null) && window.Loomio.environment === 'production') {
    return $compileProvider.debugInfoEnabled(false);
  }
});

angular.module('loomioApp').controller('ApplicationController', function($scope, $location, $filter, $rootScope, $router, KeyEventService, ScrollService, CurrentUser, BootService, AppConfig, ModalService, ChoosePlanModal, AbilityService) {
  $scope.isLoggedIn = function() {
    return AbilityService.isLoggedIn();
  };
  if ($scope.isLoggedIn()) {
    BootService.boot();
  }
  $scope.currentComponent = 'nothing yet';
  $scope.$on('currentComponent', function(event, options) {
    if (options == null) {
      options = {};
    }
    $scope.pageError = null;
    ScrollService.scrollTo(options.scrollTo || 'h1');
    return $scope.links = options.links || {};
  });
  $scope.$on('setTitle', function(event, title) {
    return document.querySelector('title').text = _.trunc(title, 300) + ' | Loomio';
  });
  $scope.$on('pageError', function(event, error) {
    return $scope.pageError = error;
  });
  $scope.$on('trialIsOverdue', function(event, group) {
    if (CurrentUser.id === group.creatorId && AppConfig.chargify && !AppConfig.chargify.nagCache[group.key]) {
      ModalService.open(ChoosePlanModal, {
        group: function() {
          return group;
        }
      });
      return AppConfig.chargify.nagCache[group.key] = true;
    }
  });
  $scope.keyDown = function(event) {
    return KeyEventService.broadcast(event);
  };
  $router.config([
    {
      path: '/dashboard',
      component: 'dashboardPage'
    }, {
      path: '/inbox',
      component: 'inboxPage'
    }, {
      path: '/groups',
      component: 'groupsPage'
    }, {
      path: '/profile',
      component: 'profilePage'
    }, {
      path: '/email_preferences',
      component: 'emailSettingsPage'
    }, {
      path: '/d/:key',
      component: 'threadPage'
    }, {
      path: '/d/:key/:stub',
      component: 'threadPage'
    }, {
      path: '/d/:key/comment/:comment',
      component: 'threadPage'
    }, {
      path: '/d/:key/proposal/:proposal',
      component: 'threadPage'
    }, {
      path: '/d/:key/proposal/:proposal/:outcome',
      component: 'threadPage'
    }, {
      path: '/m/:key/',
      component: 'proposalRedirect'
    }, {
      path: '/m/:key/:stub',
      component: 'proposalRedirect'
    }, {
      path: '/m/:key/votes/new',
      component: 'proposalRedirect'
    }, {
      path: '/g/:key/memberships',
      component: 'membershipsPage'
    }, {
      path: '/g/:key/memberships/:username',
      component: 'membershipsPage'
    }, {
      path: '/g/:key/membership_requests',
      component: 'membershipRequestsPage'
    }, {
      path: '/g/:key/previous_proposals',
      component: 'previousProposalsPage'
    }, {
      path: '/g/:key',
      component: 'groupPage'
    }, {
      path: '/g/:key/:stub',
      component: 'groupPage'
    }, {
      path: '/u/:key',
      component: 'userPage'
    }, {
      path: '/u/:key/:stub',
      component: 'userPage'
    }, {
      path: '/apps/authorized',
      component: 'authorizedAppsPage'
    }, {
      path: '/apps/registered',
      component: 'registeredAppsPage'
    }, {
      path: '/apps/registered/:id',
      component: 'registeredAppPage'
    }, {
      path: '/apps/registered/:id/:stub',
      component: 'registeredAppPage'
    }
  ]);
});

angular.module('loomioApp').filter('timeFromNowInWords', function() {
  return function(date, excludeAgo) {
    return moment(date).fromNow(excludeAgo);
  };
});

angular.module('loomioApp').filter('exactDateWithTime', function() {
  return function(date) {
    return moment(date).format('dddd MMMM Do [at] h:mm a');
  };
});

angular.module('loomioApp').filter('filterModel', function() {
  return function(records, fragment) {
    if (records == null) {
      records = [];
    }
    return _.filter(records, function(record) {
      return _.some(_.map(record.constructor.searchableFields, function(field) {
        if (typeof record[field] === 'function') {
          field = record[field]();
        }
        if ((field != null) && (field.search != null)) {
          return ~field.search(new RegExp(fragment, 'i'));
        }
      }));
    });
  };
});

angular.module('loomioApp').filter('limitByFn', function() {
  return function(items, f, args) {
    if (items) {
      return items.slice(0, f(args));
    }
  };
});

angular.module('loomioApp').filter('truncate', function() {
  return function(string, length, separator) {
    if (length == null) {
      length = 100;
    }
    if (separator == null) {
      separator = ' ';
    }
    return _.trunc(string, {
      length: length,
      separator: separator
    });
  };
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('AttachmentModel', function(BaseModel, AppConfig) {
  var AttachmentModel;
  return AttachmentModel = (function(superClass) {
    extend(AttachmentModel, superClass);

    function AttachmentModel() {
      return AttachmentModel.__super__.constructor.apply(this, arguments);
    }

    AttachmentModel.singular = 'attachment';

    AttachmentModel.plural = 'attachments';

    AttachmentModel.indices = ['id', 'commentId'];

    AttachmentModel.serializableAttributes = AppConfig.permittedParams.attachment;

    AttachmentModel.prototype.relationships = function() {
      this.belongsTo('author', {
        from: 'users',
        by: 'authorId'
      });
      return this.belongsTo('comment', {
        from: 'comments',
        by: 'commentId'
      });
    };

    AttachmentModel.prototype.formattedFilesize = function() {
      var denom, size;
      if (isNaN(this.filesize)) {
        return "(invalid file size)";
      }
      if (this.filesize < 1000) {
        denom = "bytes";
        size = this.filesize;
      } else if (this.filesize < Math.pow(1000, 2)) {
        denom = "kB";
        size = this.filesize / 1000;
      } else if (this.filesize < Math.pow(1000, 3)) {
        denom = "MB";
        size = this.filesize / Math.pow(1000, 2);
      } else {
        denom = "GB";
        size = this.filesize / Math.pow(1000, 3);
      }
      return "(" + (size.toFixed(1)) + " " + denom + ")";
    };

    return AttachmentModel;

  })(BaseModel);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('AttachmentRecordsInterface', function(BaseRecordsInterface, AttachmentModel) {
  var AttachmentRecordsInterface;
  return AttachmentRecordsInterface = (function(superClass) {
    extend(AttachmentRecordsInterface, superClass);

    function AttachmentRecordsInterface() {
      return AttachmentRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    AttachmentRecordsInterface.prototype.model = AttachmentModel;

    AttachmentRecordsInterface.prototype.upload = function(file, progress) {
      return this.remote.upload('', file, {
        data: {
          'attachment[filename]': file.name.replace(/[^a-z0-9_\-\.]/gi, '_')
        },
        fileFormDataName: 'attachment[file]'
      }, progress);
    };

    return AttachmentRecordsInterface;

  })(BaseRecordsInterface);
});

angular.module('loomioApp').factory('BaseModel', function() {
  return AngularRecordStore.BaseModelFn();
});

angular.module('loomioApp').factory('BaseRecordsInterface', function(RestfulClient, $q) {
  return AngularRecordStore.BaseRecordsInterfaceFn(RestfulClient, $q);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('CommentModel', function(DraftableModel, AppConfig) {
  var CommentModel;
  return CommentModel = (function(superClass) {
    extend(CommentModel, superClass);

    function CommentModel() {
      return CommentModel.__super__.constructor.apply(this, arguments);
    }

    CommentModel.singular = 'comment';

    CommentModel.plural = 'comments';

    CommentModel.indices = ['discussionId', 'authorId'];

    CommentModel.serializableAttributes = AppConfig.permittedParams.comment;

    CommentModel.draftParent = 'discussion';

    CommentModel.prototype.defaultValues = function() {
      return {
        usesMarkdown: true,
        newAttachmentIds: [],
        discussionId: null,
        body: ''
      };
    };

    CommentModel.prototype.relationships = function() {
      this.belongsTo('author', {
        from: 'users'
      });
      this.belongsTo('discussion');
      this.belongsTo('parent', {
        from: 'comments',
        by: 'parentId'
      });
      return this.hasMany('versions', {
        sortBy: 'createdAt'
      });
    };

    CommentModel.prototype.serialize = function() {
      var data;
      data = this.baseSerialize();
      data['comment']['new_attachment_ids'] = this.newAttachmentIds;
      return data;
    };

    CommentModel.prototype.group = function() {
      return this.discussion().group();
    };

    CommentModel.prototype.isMostRecent = function() {
      return _.last(this.discussion().comments()) === this;
    };

    CommentModel.prototype.isReply = function() {
      return this.parentId != null;
    };

    CommentModel.prototype.parent = function() {
      return this.recordStore.comments.find(this.parentId);
    };

    CommentModel.prototype.likers = function() {
      return this.recordStore.users.find(this.likerIds);
    };

    CommentModel.prototype.newAttachments = function() {
      return this.recordStore.attachments.find(this.newAttachmentIds);
    };

    CommentModel.prototype.attachments = function() {
      return this.recordStore.attachments.find({
        commentId: this.id
      });
    };

    CommentModel.prototype.authorName = function() {
      return this.author().name;
    };

    CommentModel.prototype.authorUsername = function() {
      return this.author().username;
    };

    CommentModel.prototype.authorAvatar = function() {
      return this.author().avatarOrInitials();
    };

    CommentModel.prototype.addLiker = function(user) {
      return this.likerIds.push(user.id);
    };

    CommentModel.prototype.removeLiker = function(user) {
      return this.removeLikerId(user.id);
    };

    CommentModel.prototype.removeLikerId = function(id) {
      return this.likerIds = _.without(this.likerIds, id);
    };

    CommentModel.prototype.cookedBody = function() {
      var cooked;
      cooked = this.body;
      _.each(this.mentionedUsernames, function(username) {
        return cooked = cooked.replace(RegExp("@" + username, "g"), "[[@" + username + "]]");
      });
      return cooked;
    };

    CommentModel.prototype.edited = function() {
      return this.versionsCount > 1;
    };

    CommentModel.prototype.attributeForVersion = function(attr, version) {
      if (!version) {
        return '';
      }
      if (version.changes[attr]) {
        return version.changes[attr][1];
      } else {
        return this.attributeForVersion(attr, this.recordStore.versions.find(version.previousId));
      }
    };

    return CommentModel;

  })(DraftableModel);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('CommentRecordsInterface', function(BaseRecordsInterface, CommentModel) {
  var CommentRecordsInterface;
  return CommentRecordsInterface = (function(superClass) {
    extend(CommentRecordsInterface, superClass);

    function CommentRecordsInterface() {
      return CommentRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    CommentRecordsInterface.prototype.model = CommentModel;

    CommentRecordsInterface.prototype.like = function(user, comment, success) {
      return this.remote.postMember(comment.id, "like");
    };

    CommentRecordsInterface.prototype.unlike = function(user, comment, success) {
      return this.remote.postMember(comment.id, "unlike");
    };

    return CommentRecordsInterface;

  })(BaseRecordsInterface);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('ContactMessageModel', function(BaseModel, AppConfig) {
  var ContactMessageModel;
  return ContactMessageModel = (function(superClass) {
    extend(ContactMessageModel, superClass);

    function ContactMessageModel() {
      return ContactMessageModel.__super__.constructor.apply(this, arguments);
    }

    ContactMessageModel.singular = 'contactMessage';

    ContactMessageModel.plural = 'contactMessages';

    ContactMessageModel.serializableAttributes = AppConfig.permittedParams.contact_message;

    return ContactMessageModel;

  })(BaseModel);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('ContactMessageRecordsInterface', function(BaseRecordsInterface, ContactMessageModel) {
  var ContactMessageRecordsInterface;
  return ContactMessageRecordsInterface = (function(superClass) {
    extend(ContactMessageRecordsInterface, superClass);

    function ContactMessageRecordsInterface() {
      return ContactMessageRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    ContactMessageRecordsInterface.prototype.model = ContactMessageModel;

    return ContactMessageRecordsInterface;

  })(BaseRecordsInterface);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('ContactModel', function(BaseModel) {
  var ContactModal;
  return ContactModal = (function(superClass) {
    extend(ContactModal, superClass);

    function ContactModal() {
      return ContactModal.__super__.constructor.apply(this, arguments);
    }

    ContactModal.singular = 'contact';

    ContactModal.plural = 'contacts';

    return ContactModal;

  })(BaseModel);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('ContactRecordsInterface', function(BaseRecordsInterface, ContactModel) {
  var ContactRecordsInterface;
  return ContactRecordsInterface = (function(superClass) {
    extend(ContactRecordsInterface, superClass);

    function ContactRecordsInterface() {
      return ContactRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    ContactRecordsInterface.prototype.model = ContactModel;

    ContactRecordsInterface.prototype.fetchInvitables = function(fragment, groupKey) {
      return this.fetch({
        params: {
          q: fragment,
          group_key: groupKey
        }
      });
    };

    return ContactRecordsInterface;

  })(BaseRecordsInterface);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('DidNotVoteModel', function(BaseModel) {
  var DidNotVoteModel;
  return DidNotVoteModel = (function(superClass) {
    extend(DidNotVoteModel, superClass);

    function DidNotVoteModel() {
      return DidNotVoteModel.__super__.constructor.apply(this, arguments);
    }

    DidNotVoteModel.singular = 'didNotVote';

    DidNotVoteModel.plural = 'didNotVotes';

    DidNotVoteModel.indices = ['id', 'proposalId'];

    DidNotVoteModel.prototype.relationships = function() {
      this.belongsTo('user');
      return this.belongsTo('proposal');
    };

    return DidNotVoteModel;

  })(BaseModel);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('DidNotVoteRecordsInterface', function(BaseRecordsInterface, DidNotVoteModel) {
  var DidNotVoteRecordsInterface;
  return DidNotVoteRecordsInterface = (function(superClass) {
    extend(DidNotVoteRecordsInterface, superClass);

    function DidNotVoteRecordsInterface() {
      return DidNotVoteRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    DidNotVoteRecordsInterface.prototype.model = DidNotVoteModel;

    DidNotVoteRecordsInterface.prototype.fetchByProposal = function(proposalKey, options) {
      if (options == null) {
        options = {};
      }
      return this.fetch({
        params: {
          motion_id: proposalKey,
          per: options['per']
        }
      });
    };

    return DidNotVoteRecordsInterface;

  })(BaseRecordsInterface);
});

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('DiscussionModel', function(DraftableModel, AppConfig) {
  var DiscussionModel;
  return DiscussionModel = (function(superClass) {
    extend(DiscussionModel, superClass);

    function DiscussionModel() {
      this.move = bind(this.move, this);
      this.saveVolume = bind(this.saveVolume, this);
      this.privateDefaultValue = bind(this.privateDefaultValue, this);
      this.defaultValues = bind(this.defaultValues, this);
      return DiscussionModel.__super__.constructor.apply(this, arguments);
    }

    DiscussionModel.singular = 'discussion';

    DiscussionModel.plural = 'discussions';

    DiscussionModel.uniqueIndices = ['id', 'key'];

    DiscussionModel.indices = ['groupId', 'authorId'];

    DiscussionModel.draftParent = 'group';

    DiscussionModel.serializableAttributes = AppConfig.permittedParams.discussion;

    DiscussionModel.prototype.afterConstruction = function() {
      if (this.isNew()) {
        return this["private"] = this.privateDefaultValue();
      }
    };

    DiscussionModel.prototype.defaultValues = function() {
      return {
        "private": null,
        usesMarkdown: true,
        lastSequenceId: 0,
        firstSequenceId: 0,
        lastItemAt: null,
        title: '',
        description: ''
      };
    };

    DiscussionModel.prototype.privateDefaultValue = function() {
      if (this.group()) {
        switch (this.group().discussionPrivacyOptions) {
          case 'private_only':
            return true;
          case 'public_or_private':
            return true;
          case 'public_only':
            return false;
        }
      } else {
        return null;
      }
    };

    DiscussionModel.prototype.relationships = function() {
      this.hasMany('comments', {
        sortBy: 'createdAt'
      });
      this.hasMany('events', {
        sortBy: 'sequenceId'
      });
      this.hasMany('proposals', {
        sortBy: 'createdAt',
        sortDesc: true
      });
      this.hasMany('versions', {
        sortBy: 'createdAt'
      });
      this.belongsTo('group');
      return this.belongsTo('author', {
        from: 'users'
      });
    };

    DiscussionModel.prototype.translationOptions = function() {
      return {
        title: this.title,
        groupName: this.groupName()
      };
    };

    DiscussionModel.prototype.authorName = function() {
      return this.author().name;
    };

    DiscussionModel.prototype.groupName = function() {
      if (this.group()) {
        return this.group().name;
      }
    };

    DiscussionModel.prototype.activeProposals = function() {
      return _.filter(this.proposals(), function(proposal) {
        return proposal.isActive();
      });
    };

    DiscussionModel.prototype.closedProposals = function() {
      return _.reject(this.proposals(), function(proposal) {
        return proposal.isActive();
      });
    };

    DiscussionModel.prototype.anyClosedProposals = function() {
      return _.some(this.closedProposals());
    };

    DiscussionModel.prototype.activeProposal = function() {
      return _.first(this.activeProposals());
    };

    DiscussionModel.prototype.hasActiveProposal = function() {
      return this.activeProposal() != null;
    };

    DiscussionModel.prototype.activeProposalClosingAt = function() {
      var proposal;
      proposal = this.activeProposal();
      if (proposal != null) {
        return proposal.closingAt;
      }
    };

    DiscussionModel.prototype.activeProposalClosedAt = function() {
      var proposal;
      proposal = this.activeProposal();
      if (proposal != null) {
        return proposal.closedAt;
      }
    };

    DiscussionModel.prototype.activeProposalLastVoteAt = function() {
      var proposal;
      proposal = this.activeProposal();
      if (proposal != null) {
        return proposal.lastVoteAt;
      }
    };

    DiscussionModel.prototype.isUnread = function() {
      return (this.discussionReaderId != null) && ((this.lastReadAt == null) || this.unreadActivityCount() > 0);
    };

    DiscussionModel.prototype.isImportant = function() {
      return this.starred || this.hasActiveProposal();
    };

    DiscussionModel.prototype.unreadItemsCount = function() {
      return this.itemsCount - this.readItemsCount;
    };

    DiscussionModel.prototype.unreadActivityCount = function() {
      return this.salientItemsCount - this.readSalientItemsCount;
    };

    DiscussionModel.prototype.unreadCommentsCount = function() {
      return this.commentsCount - this.readCommentsCount;
    };

    DiscussionModel.prototype.lastInboxActivity = function() {
      return this.activeProposalClosingAt() || this.lastActivityAt;
    };

    DiscussionModel.prototype.unreadPosition = function() {
      return this.lastReadSequenceId + 1;
    };

    DiscussionModel.prototype.eventIsLoaded = function(event) {
      return event.sequenceId || _.find(this.events(), function(e) {
        return e.kind === 'new_comment' && e.commentId === event.comment().id;
      });
    };

    DiscussionModel.prototype.minLoadedSequenceId = function() {
      var item;
      item = _.min(this.events(), function(event) {
        return event.sequenceId || Number.MAX_VALUE;
      });
      return item.sequenceId;
    };

    DiscussionModel.prototype.maxLoadedSequenceId = function() {
      var item;
      item = _.max(this.events(), function(event) {
        return event.sequenceId || 0;
      });
      return item.sequenceId;
    };

    DiscussionModel.prototype.membership = function() {
      return this.recordStore.memberships.find({
        userId: AppConfig.currentUserId,
        groupId: this.groupId
      })[0];
    };

    DiscussionModel.prototype.membershipVolume = function() {
      if (this.membership()) {
        return this.membership().volume;
      }
    };

    DiscussionModel.prototype.volume = function() {
      return this.discussionReaderVolume || this.membershipVolume();
    };

    DiscussionModel.prototype.saveVolume = function(volume, applyToAll) {
      if (applyToAll == null) {
        applyToAll = false;
      }
      if (applyToAll) {
        return this.membership().saveVolume(volume);
      } else {
        if (volume != null) {
          this.discussionReaderVolume = volume;
        }
        return this.remote.patchMember(this.keyOrId(), 'set_volume', {
          volume: this.discussionReaderVolume
        });
      }
    };

    DiscussionModel.prototype.isMuted = function() {
      return this.volume() === 'mute';
    };

    DiscussionModel.prototype.saveStar = function() {
      return this.remote.patchMember(this.keyOrId(), this.starred ? 'star' : 'unstar');
    };

    DiscussionModel.prototype.markAsRead = function(sequenceId) {
      if (this.discussionReaderId == null) {
        return;
      }
      if (isNaN(sequenceId)) {
        sequenceId = this.lastSequenceId;
        this.update({
          readItemsCount: this.itemsCount
        }, {
          readSalientItemsCount: this.salientItemsCount,
          readCommentsCount: this.commentsCount,
          lastReadAt: moment()
        });
      }
      if (_.isNull(this.lastReadAt) || this.lastReadSequenceId < sequenceId) {
        this.remote.patchMember(this.keyOrId(), 'mark_as_read', {
          sequence_id: sequenceId
        });
        return this.update({
          lastReadSequenceId: sequenceId
        });
      }
    };

    DiscussionModel.prototype.move = function() {
      return this.remote.patchMember(this.keyOrId(), 'move', {
        group_id: this.groupId
      });
    };

    DiscussionModel.prototype.edited = function() {
      return this.versionsCount > 1;
    };

    DiscussionModel.prototype.attributeForVersion = function(attr, version) {
      if (!version) {
        return '';
      }
      if (version.changes[attr]) {
        return version.changes[attr][1];
      } else {
        return this.attributeForVersion(attr, this.recordStore.versions.find(version.previousId));
      }
    };

    return DiscussionModel;

  })(DraftableModel);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('DiscussionRecordsInterface', function(BaseRecordsInterface, DiscussionModel) {
  var DiscussionRecordsInterface;
  return DiscussionRecordsInterface = (function(superClass) {
    extend(DiscussionRecordsInterface, superClass);

    function DiscussionRecordsInterface() {
      return DiscussionRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    DiscussionRecordsInterface.prototype.model = DiscussionModel;

    DiscussionRecordsInterface.prototype.fetchByGroup = function(groupKey, options) {
      if (options == null) {
        options = {};
      }
      options['group_id'] = groupKey;
      return this.fetch({
        params: options
      });
    };

    DiscussionRecordsInterface.prototype.fetchDashboard = function(options) {
      if (options == null) {
        options = {};
      }
      return this.fetch({
        path: 'dashboard',
        params: options
      });
    };

    DiscussionRecordsInterface.prototype.fetchInbox = function(options) {
      if (options == null) {
        options = {};
      }
      return this.fetch({
        path: 'inbox',
        params: {
          from: options['from'] || 0,
          per: options['per'] || 100,
          since: options['since'] || moment().startOf('day').subtract(6, 'week').toDate(),
          timeframe_for: options['timeframe_for'] || 'last_activity_at'
        }
      });
    };

    return DiscussionRecordsInterface;

  })(BaseRecordsInterface);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('DraftModel', function(BaseModel, AppConfig) {
  var DraftModel;
  return DraftModel = (function(superClass) {
    extend(DraftModel, superClass);

    function DraftModel() {
      return DraftModel.__super__.constructor.apply(this, arguments);
    }

    DraftModel.singular = 'draft';

    DraftModel.plural = 'drafts';

    DraftModel.uniqueIndices = ['id'];

    DraftModel.serializableAttributes = AppConfig.permittedParams.draft;

    DraftModel.prototype.afterConstruction = function() {
      var draftPath;
      draftPath = (function(_this) {
        return function() {
          return _this.remote.apiPrefix + "/" + _this.constructor.plural + "/" + (_this.draftableType.toLowerCase()) + "/" + _this.draftableId;
        };
      })(this);
      return this.remote.collectionPath = this.remote.memberPath = draftPath;
    };

    DraftModel.prototype.updateFrom = function(model) {
      var payloadField;
      payloadField = _.snakeCase(model.constructor.serializationRoot || model.constructor.singular);
      this.payload[payloadField] = model.serialize()[payloadField];
      return this.save();
    };

    return DraftModel;

  })(BaseModel);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('DraftRecordsInterface', function(BaseRecordsInterface, DraftModel) {
  var DraftRecordsInterface;
  return DraftRecordsInterface = (function(superClass) {
    extend(DraftRecordsInterface, superClass);

    function DraftRecordsInterface() {
      return DraftRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    DraftRecordsInterface.prototype.model = DraftModel;

    DraftRecordsInterface.prototype.findOrBuildFor = function(model) {
      return _.first(this.find({
        draftableType: _.capitalize(model.constructor.singular),
        draftableId: model.id
      })) || this.build({
        draftableType: _.capitalize(model.constructor.singular),
        draftableId: model.id,
        payload: {}
      });
    };

    DraftRecordsInterface.prototype.fetchFor = function(model) {
      return this.remote.get(model.constructor.singular + "/" + model.id);
    };

    return DraftRecordsInterface;

  })(BaseRecordsInterface);
});

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('DraftableModel', function(BaseModel) {
  var DraftableModel;
  return DraftableModel = (function(superClass) {
    extend(DraftableModel, superClass);

    function DraftableModel() {
      this.fetchDraft = bind(this.fetchDraft, this);
      return DraftableModel.__super__.constructor.apply(this, arguments);
    }

    DraftableModel.draftParent = 'undefined';

    DraftableModel.prototype.draft = function() {
      return this.recordStore.drafts.findOrBuildFor(this[this.constructor.draftParent]());
    };

    DraftableModel.prototype.fetchDraft = function() {
      return this.recordStore.drafts.fetchFor(this[this.constructor.draftParent]());
    };

    DraftableModel.prototype.restoreDraft = function() {
      var payloadField;
      payloadField = _.snakeCase(this.constructor.serializationRoot || this.constructor.singular);
      return this.update(_.omit(this.draft().payload[payloadField], _.isNull));
    };

    DraftableModel.prototype.resetDraft = function() {
      return this.draft().updateFrom(this.recordStore[this.constructor.plural].build());
    };

    DraftableModel.prototype.updateDraft = function() {
      return this.draft().updateFrom(this);
    };

    return DraftableModel;

  })(BaseModel);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('EventModel', function(BaseModel) {
  var EventModel;
  return EventModel = (function(superClass) {
    extend(EventModel, superClass);

    function EventModel() {
      return EventModel.__super__.constructor.apply(this, arguments);
    }

    EventModel.singular = 'event';

    EventModel.plural = 'events';

    EventModel.indices = ['id', 'discussionId'];

    EventModel.eventTypeMap = {
      'user_added_to_group': 'group',
      'membership_request_approved': 'group',
      'discussion_moved': 'group',
      'membership_requested': 'membershipRequest',
      'new_discussion': 'discussion',
      'discussion_edited': 'discussion',
      'new_motion': 'proposal',
      'motion_closed': 'proposal',
      'motion_closed_by_user': 'proposal',
      'motion_edited': 'proposal',
      'new_vote': 'proposal',
      'motion_closing_soon': 'proposal',
      'motion_outcome_created': 'proposal',
      'new_comment': 'comment',
      'comment_liked': 'comment',
      'comment_replied_to': 'comment',
      'user_mentioned': 'comment',
      'invitation_accepted': 'membership',
      'new_coordinator': 'membership'
    };

    EventModel.prototype.relationships = function() {
      this.belongsTo('membership');
      this.belongsTo('membershipRequest');
      this.belongsTo('discussion');
      this.belongsTo('comment');
      this.belongsTo('proposal');
      this.belongsTo('vote');
      this.belongsTo('actor', {
        from: 'users'
      });
      return this.belongsTo('version');
    };

    EventModel.prototype.group = function() {
      switch (this.kind) {
        case 'discussion_moved':
        case 'membership_request_approved':
        case 'user_added_to_group':
          return this.recordStore.groups.find(this.groupId);
        case 'membership_requested':
          return this.membershipRequest().group();
        case 'invitation_accepted':
        case 'new_coordinator':
          return this.membership().group();
        case 'new_discussion':
        case 'discussion_edited':
          return this.discussion().group();
      }
    };

    EventModel.prototype["delete"] = function() {
      return this.deleted = true;
    };

    EventModel.prototype.actorName = function() {
      return this.actor().name;
    };

    EventModel.prototype.relevantRecordType = function() {
      return this.constructor.eventTypeMap[this.kind];
    };

    EventModel.prototype.relevantRecord = function() {
      return this[this.relevantRecordType()]();
    };

    return EventModel;

  })(BaseModel);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('EventRecordsInterface', function(BaseRecordsInterface, EventModel) {
  var EventRecordsInterface;
  return EventRecordsInterface = (function(superClass) {
    extend(EventRecordsInterface, superClass);

    function EventRecordsInterface() {
      return EventRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    EventRecordsInterface.prototype.model = EventModel;

    EventRecordsInterface.prototype.fetchByDiscussion = function(discussionKey, options) {
      if (options == null) {
        options = {};
      }
      options['discussion_key'] = discussionKey;
      return this.fetch({
        params: options
      });
    };

    EventRecordsInterface.prototype.findByDiscussionAndSequenceId = function(discussion, sequenceId) {
      return this.collection.chain().find({
        discussionId: discussion.id
      }).find({
        sequenceId: sequenceId
      }).data()[0];
    };

    return EventRecordsInterface;

  })(BaseRecordsInterface);
});

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('GroupModel', function(DraftableModel, AppConfig) {
  var GroupModel;
  return GroupModel = (function(superClass) {
    extend(GroupModel, superClass);

    function GroupModel() {
      this.uploadPhoto = bind(this.uploadPhoto, this);
      this.archive = bind(this.archive, this);
      return GroupModel.__super__.constructor.apply(this, arguments);
    }

    GroupModel.singular = 'group';

    GroupModel.plural = 'groups';

    GroupModel.uniqueIndices = ['id', 'key'];

    GroupModel.indices = ['parentId'];

    GroupModel.serializableAttributes = AppConfig.permittedParams.group;

    GroupModel.draftParent = 'draftParent';

    GroupModel.prototype.draftParent = function() {
      return this.parent() || this.recordStore.users.find(AppConfig.currentUserId);
    };

    GroupModel.prototype.defaultValues = function() {
      return {
        parentId: null,
        name: '',
        description: '',
        groupPrivacy: 'closed',
        discussionPrivacyOptions: 'private_only',
        membershipGrantedUpon: 'approval',
        membersCanAddMembers: true,
        membersCanEditDiscussions: true,
        membersCanEditComments: true,
        membersCanRaiseMotions: true,
        membersCanVote: true,
        membersCanStartDiscussions: true,
        membersCanCreateSubgroups: false,
        motionsCanBeEdited: false
      };
    };

    GroupModel.prototype.relationships = function() {
      this.hasMany('discussions');
      this.hasMany('proposals');
      this.hasMany('membershipRequests');
      this.hasMany('memberships');
      this.hasMany('invitations');
      this.hasMany('subgroups', {
        from: 'groups',
        "with": 'parentId',
        of: 'id'
      });
      return this.belongsTo('parent', {
        from: 'groups'
      });
    };

    GroupModel.prototype.shareableInvitation = function() {
      return this.recordStore.invitations.find({
        singleUse: false,
        groupId: this.id
      })[0];
    };

    GroupModel.prototype.closedProposals = function() {
      return _.filter(this.proposals(), function(proposal) {
        return proposal.isClosed();
      });
    };

    GroupModel.prototype.hasPreviousProposals = function() {
      return _.some(this.closedProposals());
    };

    GroupModel.prototype.pendingMembershipRequests = function() {
      return _.filter(this.membershipRequests(), function(membershipRequest) {
        return membershipRequest.isPending();
      });
    };

    GroupModel.prototype.hasPendingMembershipRequests = function() {
      return _.some(this.pendingMembershipRequests());
    };

    GroupModel.prototype.hasPendingMembershipRequestFrom = function(user) {
      return _.some(this.pendingMembershipRequests(), function(request) {
        return request.requestorId === user.id;
      });
    };

    GroupModel.prototype.previousMembershipRequests = function() {
      return _.filter(this.membershipRequests(), function(membershipRequest) {
        return !membershipRequest.isPending();
      });
    };

    GroupModel.prototype.hasPreviousMembershipRequests = function() {
      return _.some(this.previousMembershipRequests());
    };

    GroupModel.prototype.pendingInvitations = function() {
      return _.filter(this.invitations(), function(invitation) {
        return invitation.isPending() && invitation.singleUse;
      });
    };

    GroupModel.prototype.hasPendingInvitations = function() {
      return _.some(this.pendingInvitations());
    };

    GroupModel.prototype.organisationDiscussions = function() {
      return this.recordStore.discussions.find({
        groupId: {
          $in: this.organisationIds()
        },
        discussionReaderId: {
          $ne: null
        }
      });
    };

    GroupModel.prototype.organisationIds = function() {
      return _.pluck(this.subgroups(), 'id').concat(this.id);
    };

    GroupModel.prototype.organisationSubdomain = function() {
      if (this.isSubgroup()) {
        return this.parent().subdomain;
      } else {
        return this.subdomain;
      }
    };

    GroupModel.prototype.memberships = function() {
      return this.recordStore.memberships.find({
        groupId: this.id
      });
    };

    GroupModel.prototype.membershipFor = function(user) {
      return _.find(this.memberships(), function(membership) {
        return membership.userId === user.id;
      });
    };

    GroupModel.prototype.members = function() {
      return this.recordStore.users.find({
        id: {
          $in: this.memberIds()
        }
      });
    };

    GroupModel.prototype.adminMemberships = function() {
      return _.filter(this.memberships(), function(membership) {
        return membership.admin;
      });
    };

    GroupModel.prototype.admins = function() {
      var adminIds;
      adminIds = _.map(this.adminMemberships(), function(membership) {
        return membership.userId;
      });
      return this.recordStore.users.find({
        id: {
          $in: adminIds
        }
      });
    };

    GroupModel.prototype.coordinatorsIncludes = function(user) {
      return _.some(this.recordStore.memberships.where({
        groupId: this.id,
        userId: user.id
      }));
    };

    GroupModel.prototype.memberIds = function() {
      return _.map(this.memberships(), function(membership) {
        return membership.userId;
      });
    };

    GroupModel.prototype.adminIds = function() {
      return _.map(this.adminMemberships(), function(membership) {
        return membership.userId;
      });
    };

    GroupModel.prototype.parentName = function() {
      if (this.parent() != null) {
        return this.parent().name;
      }
    };

    GroupModel.prototype.privacyIsOpen = function() {
      return this.groupPrivacy === 'open';
    };

    GroupModel.prototype.privacyIsClosed = function() {
      return this.groupPrivacy === 'closed';
    };

    GroupModel.prototype.privacyIsSecret = function() {
      return this.groupPrivacy === 'secret';
    };

    GroupModel.prototype.allowPublicDiscussions = function() {
      if (this.privacyIsClosed() && this.isNew()) {
        return true;
      } else {
        return this.discussionPrivacyOptions !== 'private_only';
      }
    };

    GroupModel.prototype.isSubgroup = function() {
      return this.parentId != null;
    };

    GroupModel.prototype.isArchived = function() {
      return this.archivedAt != null;
    };

    GroupModel.prototype.isParent = function() {
      return this.parentId == null;
    };

    GroupModel.prototype.logoUrl = function() {
      if (this.logoUrlMedium) {
        return this.logoUrlMedium;
      } else if (this.isSubgroup()) {
        return this.parent().logoUrl();
      } else {
        return '/img/default-logo-medium.png';
      }
    };

    GroupModel.prototype.coverUrl = function() {
      if (this.isSubgroup() && !this.hasCustomCover) {
        return this.parent().coverUrl();
      } else {
        return this.coverUrlDesktop;
      }
    };

    GroupModel.prototype.archive = function() {
      return this.remote.patchMember(this.key, 'archive').then((function(_this) {
        return function() {
          _this.remove();
          return _.each(_this.memberships(), function(m) {
            return m.remove();
          });
        };
      })(this));
    };

    GroupModel.prototype.uploadPhoto = function(file, kind) {
      return this.remote.upload(this.key + "/upload_photo/" + kind, file);
    };

    GroupModel.prototype.hasNoSubscription = function() {
      return this.subscriptionKind == null;
    };

    GroupModel.prototype.trialIsOverdue = function() {
      return this.subscriptionKind === 'trial' && this.subscriptionExpiresAt.clone().add(1, 'days') < moment();
    };

    GroupModel.prototype.noInvitationsSent = function() {
      return this.membershipsCount < 2 && this.invitationsCount < 2;
    };

    GroupModel.prototype.isSubgroupOfSecretParent = function() {
      return this.isSubgroup() && this.parent().privacyIsSecret();
    };

    return GroupModel;

  })(DraftableModel);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('GroupRecordsInterface', function(BaseRecordsInterface, GroupModel) {
  var GroupRecordsInterface;
  return GroupRecordsInterface = (function(superClass) {
    extend(GroupRecordsInterface, superClass);

    function GroupRecordsInterface() {
      return GroupRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    GroupRecordsInterface.prototype.model = GroupModel;

    GroupRecordsInterface.prototype.fetchByParent = function(parentGroup) {
      return this.fetch({
        path: parentGroup.id + "/subgroups"
      });
    };

    return GroupRecordsInterface;

  })(BaseRecordsInterface);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('InvitationFormModel', function(DraftableModel, AppConfig) {
  var InvitationFormModel;
  return InvitationFormModel = (function(superClass) {
    extend(InvitationFormModel, superClass);

    function InvitationFormModel() {
      return InvitationFormModel.__super__.constructor.apply(this, arguments);
    }

    InvitationFormModel.singular = 'invitationForm';

    InvitationFormModel.plural = 'invitationForms';

    InvitationFormModel.draftParent = 'group';

    InvitationFormModel.serializableFields = ['emails', 'message'];

    InvitationFormModel.prototype.defaultValues = function() {
      return {
        emails: "",
        message: ""
      };
    };

    InvitationFormModel.prototype.relationships = function() {
      return this.belongsTo('group');
    };

    return InvitationFormModel;

  })(DraftableModel);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('InvitationFormRecordsInterface', function(BaseRecordsInterface, InvitationFormModel) {
  var InvitationFormRecordsInterface;
  return InvitationFormRecordsInterface = (function(superClass) {
    extend(InvitationFormRecordsInterface, superClass);

    function InvitationFormRecordsInterface() {
      return InvitationFormRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    InvitationFormRecordsInterface.prototype.model = InvitationFormModel;

    return InvitationFormRecordsInterface;

  })(BaseRecordsInterface);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('InvitationModel', function(BaseModel, AppConfig) {
  var InvitationModel;
  return InvitationModel = (function(superClass) {
    extend(InvitationModel, superClass);

    function InvitationModel() {
      return InvitationModel.__super__.constructor.apply(this, arguments);
    }

    InvitationModel.singular = 'invitation';

    InvitationModel.plural = 'invitations';

    InvitationModel.indices = ['groupId'];

    InvitationModel.serializableAttributes = AppConfig.permittedParams.invitation;

    InvitationModel.prototype.relationships = function() {
      return this.belongsTo('group');
    };

    InvitationModel.prototype.isPending = function() {
      return (this.cancelledAt == null) && (this.acceptedAt == null);
    };

    return InvitationModel;

  })(BaseModel);
});

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('InvitationRecordsInterface', function(BaseRecordsInterface, InvitationModel) {
  var InvitationRecordsInterface;
  return InvitationRecordsInterface = (function(superClass) {
    extend(InvitationRecordsInterface, superClass);

    function InvitationRecordsInterface() {
      this.sendByEmail = bind(this.sendByEmail, this);
      return InvitationRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    InvitationRecordsInterface.prototype.model = InvitationModel;

    InvitationRecordsInterface.prototype.sendByEmail = function(invitationForm) {
      return this.remote.create(_.merge(invitationForm.serialize(), {
        group_id: invitationForm.groupId
      }));
    };

    InvitationRecordsInterface.prototype.fetchPendingByGroup = function(groupKey, options) {
      if (options == null) {
        options = {};
      }
      options['group_key'] = groupKey;
      return this.remote.get('/pending', options);
    };

    InvitationRecordsInterface.prototype.fetchShareableInvitationByGroupId = function(groupId, options) {
      if (options == null) {
        options = {};
      }
      options['group_id'] = groupId;
      return this.remote.get('/shareable', options);
    };

    return InvitationRecordsInterface;

  })(BaseRecordsInterface);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('MembershipModel', function(BaseModel, AppConfig) {
  var MembershipModel;
  return MembershipModel = (function(superClass) {
    extend(MembershipModel, superClass);

    function MembershipModel() {
      return MembershipModel.__super__.constructor.apply(this, arguments);
    }

    MembershipModel.singular = 'membership';

    MembershipModel.plural = 'memberships';

    MembershipModel.indices = ['id', 'userId', 'groupId'];

    MembershipModel.searchableFields = ['userName', 'userUsername'];

    MembershipModel.serializableAttributes = AppConfig.permittedParams.membership;

    MembershipModel.prototype.relationships = function() {
      this.belongsTo('group');
      this.belongsTo('user');
      return this.belongsTo('inviter', {
        from: 'users'
      });
    };

    MembershipModel.prototype.userName = function() {
      return this.user().name;
    };

    MembershipModel.prototype.userUsername = function() {
      return this.user().username;
    };

    MembershipModel.prototype.groupName = function() {
      return this.group().name;
    };

    MembershipModel.prototype.saveVolume = function(volume, applyToAll) {
      if (applyToAll == null) {
        applyToAll = false;
      }
      return this.remote.patchMember(this.keyOrId(), 'set_volume', {
        volume: volume,
        apply_to_all: applyToAll
      }).then((function(_this) {
        return function() {
          if (applyToAll) {
            _.each(_this.user().allThreads(), function(thread) {
              return thread.update({
                discussionReaderVolume: null
              });
            });
            return _.each(_this.user().memberships(), function(membership) {
              return membership.update({
                volume: volume
              });
            });
          } else {
            return _.each(_this.group().discussions(), function(discussion) {
              return discussion.update({
                discussionReaderVolume: null
              });
            });
          }
        };
      })(this));
    };

    MembershipModel.prototype.isMuted = function() {
      return this.volume === 'mute';
    };

    return MembershipModel;

  })(BaseModel);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('MembershipRecordsInterface', function(BaseRecordsInterface, MembershipModel) {
  var MembershipRecordsInterface;
  return MembershipRecordsInterface = (function(superClass) {
    extend(MembershipRecordsInterface, superClass);

    function MembershipRecordsInterface() {
      return MembershipRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    MembershipRecordsInterface.prototype.model = MembershipModel;

    MembershipRecordsInterface.prototype.joinGroup = function(group) {
      return this.remote.post('join_group', {
        group_id: group.id
      });
    };

    MembershipRecordsInterface.prototype.fetchMyMemberships = function() {
      return this.fetch({
        path: 'my_memberships'
      });
    };

    MembershipRecordsInterface.prototype.fetchByNameFragment = function(fragment, groupKey, limit) {
      if (limit == null) {
        limit = 5;
      }
      return this.fetch({
        path: 'autocomplete',
        params: {
          q: fragment,
          group_key: groupKey,
          per: limit
        }
      });
    };

    MembershipRecordsInterface.prototype.fetchInvitables = function(fragment, groupKey, limit) {
      if (limit == null) {
        limit = 5;
      }
      return this.fetch({
        path: 'invitables',
        params: {
          q: fragment,
          group_key: groupKey,
          per: limit
        }
      });
    };

    MembershipRecordsInterface.prototype.fetchByGroup = function(groupKey, options) {
      if (options == null) {
        options = {};
      }
      return this.fetch({
        params: {
          group_key: groupKey,
          per: options['per'] || 30
        }
      });
    };

    MembershipRecordsInterface.prototype.fetchByUser = function(userKey, options) {
      if (options == null) {
        options = {};
      }
      return this.fetch({
        path: 'for_user',
        params: {
          user_key: userKey,
          per: options['per'] || 30
        }
      });
    };

    MembershipRecordsInterface.prototype.addUsersToSubgroup = function(arg) {
      var groupId, userIds;
      groupId = arg.groupId, userIds = arg.userIds;
      return this.remote.post('add_to_subgroup', {
        group_id: groupId,
        user_ids: userIds
      });
    };

    MembershipRecordsInterface.prototype.makeAdmin = function(membership) {
      return this.remote.postMember(membership.id, "make_admin");
    };

    MembershipRecordsInterface.prototype.removeAdmin = function(membership) {
      return this.remote.postMember(membership.id, "remove_admin");
    };

    return MembershipRecordsInterface;

  })(BaseRecordsInterface);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('MembershipRequestModel', function(BaseModel, AppConfig) {
  var MembershipRequestModel;
  return MembershipRequestModel = (function(superClass) {
    extend(MembershipRequestModel, superClass);

    function MembershipRequestModel() {
      return MembershipRequestModel.__super__.constructor.apply(this, arguments);
    }

    MembershipRequestModel.singular = 'membershipRequest';

    MembershipRequestModel.plural = 'membershipRequests';

    MembershipRequestModel.indices = ['id', 'groupId'];

    MembershipRequestModel.serializableAttributes = AppConfig.permittedParams.membership_request;

    MembershipRequestModel.prototype.initialize = function(data) {
      this.baseInitialize(data);
      if (!this.byExistingUser()) {
        return this.fakeUser = {
          name: this.name,
          email: this.email,
          avatarKind: 'initials',
          avatarInitials: _.map(this.name.split(' '), function(t) {
            return t[0];
          }).join('')
        };
      }
    };

    MembershipRequestModel.prototype.relationships = function() {
      this.belongsTo('group');
      this.belongsTo('requestor', {
        from: 'users'
      });
      return this.belongsTo('responder', {
        from: 'users'
      });
    };

    MembershipRequestModel.prototype.actor = function() {
      if (this.byExistingUser()) {
        return this.requestor();
      } else {
        return this.fakeUser;
      }
    };

    MembershipRequestModel.prototype.byExistingUser = function() {
      return this.requestorId != null;
    };

    MembershipRequestModel.prototype.isPending = function() {
      return this.respondedAt == null;
    };

    MembershipRequestModel.prototype.formattedResponse = function() {
      return _.capitalize(this.response);
    };

    return MembershipRequestModel;

  })(BaseModel);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('MembershipRequestRecordsInterface', function(BaseRecordsInterface, MembershipRequestModel) {
  var MembershipRequestRecordsInterface;
  return MembershipRequestRecordsInterface = (function(superClass) {
    extend(MembershipRequestRecordsInterface, superClass);

    function MembershipRequestRecordsInterface() {
      return MembershipRequestRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    MembershipRequestRecordsInterface.prototype.model = MembershipRequestModel;

    MembershipRequestRecordsInterface.prototype.fetchMyPendingByGroup = function(groupKey, options) {
      if (options == null) {
        options = {};
      }
      options['group_key'] = groupKey;
      return this.remote.get('/my_pending', options);
    };

    MembershipRequestRecordsInterface.prototype.fetchPendingByGroup = function(groupKey, options) {
      if (options == null) {
        options = {};
      }
      options['group_key'] = groupKey;
      return this.remote.get('/pending', options);
    };

    MembershipRequestRecordsInterface.prototype.fetchPreviousByGroup = function(groupKey, options) {
      if (options == null) {
        options = {};
      }
      options['group_key'] = groupKey;
      return this.remote.get('/previous', options);
    };

    MembershipRequestRecordsInterface.prototype.approve = function(membershipRequest) {
      return this.remote.postMember(membershipRequest.id, 'approve', {
        group_key: membershipRequest.group().key
      });
    };

    MembershipRequestRecordsInterface.prototype.ignore = function(membershipRequest) {
      return this.remote.postMember(membershipRequest.id, 'ignore', {
        group_key: membershipRequest.group().key
      });
    };

    return MembershipRequestRecordsInterface;

  })(BaseRecordsInterface);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('NotificationModel', function(BaseModel) {
  var NotificationModel;
  return NotificationModel = (function(superClass) {
    extend(NotificationModel, superClass);

    function NotificationModel() {
      return NotificationModel.__super__.constructor.apply(this, arguments);
    }

    NotificationModel.singular = 'notification';

    NotificationModel.plural = 'notifications';

    NotificationModel.prototype.relationships = function() {
      this.belongsTo('event');
      return this.belongsTo('user');
    };

    NotificationModel.prototype.actor = function() {
      return this.event().actor();
    };

    NotificationModel.prototype.kind = function() {
      return this.event().kind;
    };

    NotificationModel.prototype.group = function() {
      return this.event().group();
    };

    NotificationModel.prototype.actionPath = function() {
      switch (this.kind()) {
        case 'motion_closed':
        case 'motion_closed_by_user':
          return 'outcome';
        case 'invitation_accepted':
          return this.actor().username;
      }
    };

    NotificationModel.prototype.relevantRecord = function() {
      return this.event().relevantRecord();
    };

    return NotificationModel;

  })(BaseModel);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('NotificationRecordsInterface', function(BaseRecordsInterface, NotificationModel) {
  var NotificationRecordsInterface;
  return NotificationRecordsInterface = (function(superClass) {
    extend(NotificationRecordsInterface, superClass);

    function NotificationRecordsInterface() {
      return NotificationRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    NotificationRecordsInterface.prototype.model = NotificationModel;

    NotificationRecordsInterface.prototype.fetchMyNotifications = function() {
      return this.fetch({
        params: {
          from: 0,
          per: 25
        },
        cacheKey: "myNotifications"
      });
    };

    NotificationRecordsInterface.prototype.viewed = function() {
      var any;
      any = false;
      _.each(this.collection.find({
        viewed: {
          $ne: true
        }
      }), (function(_this) {
        return function(n) {
          any = true;
          return n.update({
            viewed: true
          });
        };
      })(this));
      if (any) {
        return this.remote.post('viewed');
      }
    };

    return NotificationRecordsInterface;

  })(BaseRecordsInterface);
});

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('OauthApplicationModel', function(BaseModel, AppConfig) {
  var OauthApplicationModel;
  return OauthApplicationModel = (function(superClass) {
    extend(OauthApplicationModel, superClass);

    function OauthApplicationModel() {
      this.uploadLogo = bind(this.uploadLogo, this);
      return OauthApplicationModel.__super__.constructor.apply(this, arguments);
    }

    OauthApplicationModel.singular = 'oauthApplication';

    OauthApplicationModel.plural = 'oauthApplications';

    OauthApplicationModel.serializationRoot = 'oauth_application';

    OauthApplicationModel.serializableAttributes = AppConfig.permittedParams.oauth_application;

    OauthApplicationModel.prototype.defaultValues = function() {
      return {
        logoUrl: '/img/default-logo-medium.png'
      };
    };

    OauthApplicationModel.prototype.redirectUriArray = function() {
      return this.redirectUri.split("\n");
    };

    OauthApplicationModel.prototype.revokeAccess = function() {
      return this.remote.postMember(this.id, 'revoke_access');
    };

    OauthApplicationModel.prototype.uploadLogo = function(file) {
      return this.remote.upload(this.id + "/upload_logo", file);
    };

    return OauthApplicationModel;

  })(BaseModel);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('OauthApplicationRecordsInterface', function(BaseRecordsInterface, OauthApplicationModel) {
  var OauthApplicationRecordsInterface;
  return OauthApplicationRecordsInterface = (function(superClass) {
    extend(OauthApplicationRecordsInterface, superClass);

    function OauthApplicationRecordsInterface() {
      return OauthApplicationRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    OauthApplicationRecordsInterface.prototype.model = OauthApplicationModel;

    OauthApplicationRecordsInterface.prototype.fetchOwned = function(options) {
      if (options == null) {
        options = {};
      }
      return this.fetch({
        path: 'owned',
        params: options
      });
    };

    OauthApplicationRecordsInterface.prototype.fetchAuthorized = function(options) {
      if (options == null) {
        options = {};
      }
      return this.fetch({
        path: 'authorized',
        params: options
      });
    };

    return OauthApplicationRecordsInterface;

  })(BaseRecordsInterface);
});

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('ProposalModel', function(BaseModel, AppConfig, DraftableModel) {
  var ProposalModel;
  return ProposalModel = (function(superClass) {
    extend(ProposalModel, superClass);

    function ProposalModel() {
      this.updateOutcome = bind(this.updateOutcome, this);
      this.createOutcome = bind(this.createOutcome, this);
      this.close = bind(this.close, this);
      return ProposalModel.__super__.constructor.apply(this, arguments);
    }

    ProposalModel.singular = 'proposal';

    ProposalModel.plural = 'proposals';

    ProposalModel.uniqueIndices = ['id', 'key'];

    ProposalModel.indices = ['discussionId'];

    ProposalModel.serializationRoot = 'motion';

    ProposalModel.serializableAttributes = AppConfig.permittedParams.motion;

    ProposalModel.draftParent = 'discussion';

    ProposalModel.prototype.defaultValues = function() {
      return {
        description: '',
        outcome: '',
        voteCounts: {
          yes: 0,
          no: 0,
          abstain: 0,
          block: 0
        },
        closingAt: moment().add(3, 'days').startOf('hour')
      };
    };

    ProposalModel.prototype.relationships = function() {
      this.hasMany('votes', {
        sortBy: 'createdAt',
        sortDesc: true
      });
      this.hasMany('didNotVotes');
      this.belongsTo('author', {
        from: 'users'
      });
      return this.belongsTo('discussion');
    };

    ProposalModel.prototype.positionVerbs = ['agree', 'abstain', 'disagree', 'block'];

    ProposalModel.prototype.positions = ['yes', 'abstain', 'no', 'block'];

    ProposalModel.prototype.closingSoon = function() {
      return this.isActive() && this.closingAt < moment().add(24, 'hours').toDate();
    };

    ProposalModel.prototype.canBeEdited = function() {
      return this.isNew() || !this.hasVotes();
    };

    ProposalModel.prototype.hasVotes = function() {
      return this.votes().length > 0;
    };

    ProposalModel.prototype.group = function() {
      return this.discussion().group();
    };

    ProposalModel.prototype.voters = function() {
      return this.recordStore.users.find(this.voterIds());
    };

    ProposalModel.prototype.voterIds = function() {
      return _.pluck(this.votes(), 'authorId');
    };

    ProposalModel.prototype.authorName = function() {
      return this.author().name;
    };

    ProposalModel.prototype.isActive = function() {
      return !this.isClosed();
    };

    ProposalModel.prototype.isClosed = function() {
      return (this.closedAt != null) || ((this.closingAt != null) && this.closingAt.isBefore());
    };

    ProposalModel.prototype.uniqueVotesByUserId = function() {
      var votesByUserId;
      votesByUserId = {};
      _.each(_.sortBy(this.votes(), 'createdAt'), function(vote) {
        return votesByUserId[vote.authorId] = vote;
      });
      return votesByUserId;
    };

    ProposalModel.prototype.uniqueVotes = function() {
      return _.values(this.uniqueVotesByUserId());
    };

    ProposalModel.prototype.numberVoted = function() {
      return this.uniqueVotes().length;
    };

    ProposalModel.prototype.percentVoted = function() {
      var groupSize, numVoted;
      numVoted = this.numberVoted();
      groupSize = this.groupSizeWhenVoting();
      if (numVoted === 0 || groupSize === 0) {
        return 0;
      }
      return (100 * numVoted / groupSize).toFixed(0);
    };

    ProposalModel.prototype.groupSizeWhenVoting = function() {
      if (this.isActive()) {
        return this.group().membershipsCount;
      } else {
        return this.numberVoted() + parseInt(this.membersNotVotedCount);
      }
    };

    ProposalModel.prototype.lastVoteByUser = function(user) {
      return this.uniqueVotesByUserId()[user.id];
    };

    ProposalModel.prototype.userHasVoted = function(user) {
      return this.lastVoteByUser(user) != null;
    };

    ProposalModel.prototype.close = function() {
      return this.remote.postMember(this.id, "close");
    };

    ProposalModel.prototype.hasOutcome = function() {
      return _.some(this.outcome);
    };

    ProposalModel.prototype.undecidedMembers = function() {
      if (this.isActive()) {
        return _.difference(this.group().members(), this.voters());
      } else {
        return this.recordStore.users.find(_.pluck(this.didNotVotes(), 'userId'));
      }
    };

    ProposalModel.prototype.hasUndecidedMembers = function() {
      return this.membersNotVotedCount > 0;
    };

    ProposalModel.prototype.createOutcome = function() {
      return this.remote.postMember(this.id, "create_outcome", {
        motion: {
          outcome: this.outcome
        }
      });
    };

    ProposalModel.prototype.updateOutcome = function() {
      return this.remote.postMember(this.id, "update_outcome", {
        motion: {
          outcome: this.outcome
        }
      });
    };

    ProposalModel.prototype.fetchUndecidedMembers = function() {
      if (this.isActive()) {
        return this.recordStore.memberships.fetchByGroup(this.group().key, {
          per: 500
        });
      } else {
        return this.recordStore.didNotVotes.fetchByProposal(this.key, {
          per: 500
        });
      }
    };

    return ProposalModel;

  })(DraftableModel);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('ProposalRecordsInterface', function(BaseRecordsInterface, ProposalModel) {
  var ProposalRecordsInterface;
  return ProposalRecordsInterface = (function(superClass) {
    extend(ProposalRecordsInterface, superClass);

    function ProposalRecordsInterface() {
      return ProposalRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    ProposalRecordsInterface.prototype.model = ProposalModel;

    ProposalRecordsInterface.prototype.fetchByDiscussion = function(discussion) {
      return this.fetch({
        params: {
          discussion_key: discussion.key
        },
        cacheKey: "proposalsFor" + discussion.key
      });
    };

    ProposalRecordsInterface.prototype.fetchClosedByGroup = function(groupKey) {
      return this.fetch({
        path: 'closed',
        params: {
          group_key: groupKey
        }
      });
    };

    return ProposalRecordsInterface;

  })(BaseRecordsInterface);
});

angular.module('loomioApp').factory('RecordStore', function() {
  return AngularRecordStore.RecordStoreFn();
});

angular.module('loomioApp').factory('Records', function(RecordStore, RecordStoreDatabaseName, AttachmentRecordsInterface, CommentRecordsInterface, DiscussionRecordsInterface, EventRecordsInterface, GroupRecordsInterface, MembershipRecordsInterface, MembershipRequestRecordsInterface, NotificationRecordsInterface, ProposalRecordsInterface, UserRecordsInterface, VoteRecordsInterface, DidNotVoteRecordsInterface, SearchResultRecordsInterface, ContactRecordsInterface, InvitationRecordsInterface, InvitationFormRecordsInterface, VersionRecordsInterface, DraftRecordsInterface, TranslationRecordsInterface, OauthApplicationRecordsInterface) {
  var db, recordStore;
  db = new loki(RecordStoreDatabaseName);
  recordStore = new RecordStore(db);
  recordStore.addRecordsInterface(AttachmentRecordsInterface);
  recordStore.addRecordsInterface(CommentRecordsInterface);
  recordStore.addRecordsInterface(DiscussionRecordsInterface);
  recordStore.addRecordsInterface(EventRecordsInterface);
  recordStore.addRecordsInterface(GroupRecordsInterface);
  recordStore.addRecordsInterface(MembershipRecordsInterface);
  recordStore.addRecordsInterface(MembershipRequestRecordsInterface);
  recordStore.addRecordsInterface(NotificationRecordsInterface);
  recordStore.addRecordsInterface(ProposalRecordsInterface);
  recordStore.addRecordsInterface(UserRecordsInterface);
  recordStore.addRecordsInterface(VoteRecordsInterface);
  recordStore.addRecordsInterface(DidNotVoteRecordsInterface);
  recordStore.addRecordsInterface(SearchResultRecordsInterface);
  recordStore.addRecordsInterface(ContactRecordsInterface);
  recordStore.addRecordsInterface(InvitationRecordsInterface);
  recordStore.addRecordsInterface(InvitationFormRecordsInterface);
  recordStore.addRecordsInterface(TranslationRecordsInterface);
  recordStore.addRecordsInterface(VersionRecordsInterface);
  recordStore.addRecordsInterface(DraftRecordsInterface);
  recordStore.addRecordsInterface(OauthApplicationRecordsInterface);
  return recordStore;
});

angular.module('loomioApp').factory('RestfulClient', function($http, $upload) {
  return AngularRecordStore.RestfulClientFn($http, $upload);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('SearchResultModel', function(BaseModel) {
  var SearchResultModel;
  return SearchResultModel = (function(superClass) {
    extend(SearchResultModel, superClass);

    function SearchResultModel() {
      return SearchResultModel.__super__.constructor.apply(this, arguments);
    }

    SearchResultModel.singular = 'searchResult';

    SearchResultModel.plural = 'searchResults';

    SearchResultModel.apiEndPoint = 'search';

    return SearchResultModel;

  })(BaseModel);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('SearchResultRecordsInterface', function(BaseRecordsInterface, SearchResultModel) {
  var SearchResultRecordsInterface;
  return SearchResultRecordsInterface = (function(superClass) {
    extend(SearchResultRecordsInterface, superClass);

    function SearchResultRecordsInterface() {
      return SearchResultRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    SearchResultRecordsInterface.prototype.model = SearchResultModel;

    SearchResultRecordsInterface.prototype.fetchByFragment = function(fragment) {
      return this.fetch({
        params: {
          q: fragment,
          per: 5
        }
      });
    };

    return SearchResultRecordsInterface;

  })(BaseRecordsInterface);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('TranslationModel', function(BaseModel) {
  var TranslationModel;
  return TranslationModel = (function(superClass) {
    extend(TranslationModel, superClass);

    function TranslationModel() {
      return TranslationModel.__super__.constructor.apply(this, arguments);
    }

    TranslationModel.singular = 'translation';

    TranslationModel.plural = 'translations';

    TranslationModel.indices = ['id'];

    return TranslationModel;

  })(BaseModel);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('TranslationRecordsInterface', function(BaseRecordsInterface, TranslationModel) {
  var TranslationRecordsInterface;
  return TranslationRecordsInterface = (function(superClass) {
    extend(TranslationRecordsInterface, superClass);

    function TranslationRecordsInterface() {
      return TranslationRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    TranslationRecordsInterface.prototype.model = TranslationModel;

    TranslationRecordsInterface.prototype.fetchTranslation = function(translatable, language) {
      return this.fetch({
        path: 'inline',
        params: {
          model: translatable.constructor.singular,
          id: translatable.id,
          to: language
        }
      });
    };

    return TranslationRecordsInterface;

  })(BaseRecordsInterface);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('UserModel', function(BaseModel, AppConfig) {
  var UserModel;
  return UserModel = (function(superClass) {
    extend(UserModel, superClass);

    function UserModel() {
      return UserModel.__super__.constructor.apply(this, arguments);
    }

    UserModel.singular = 'user';

    UserModel.plural = 'users';

    UserModel.apiEndPoint = 'profile';

    UserModel.serializableAttributes = AppConfig.permittedParams.user;

    UserModel.prototype.relationships = function() {
      this.hasMany('memberships');
      this.hasMany('notifications');
      this.hasMany('contacts');
      return this.hasMany('versions');
    };

    UserModel.prototype.membershipFor = function(group) {
      return _.first(this.recordStore.memberships.find({
        groupId: group.id,
        userId: this.id
      }));
    };

    UserModel.prototype.isMemberOf = function(group) {
      return this.membershipFor(group) != null;
    };

    UserModel.prototype.groupIds = function() {
      return _.map(this.memberships(), 'groupId');
    };

    UserModel.prototype.groups = function() {
      var groups;
      groups = _.filter(this.recordStore.groups.find({
        id: {
          $in: this.groupIds()
        }
      }), function(group) {
        return !group.isArchived();
      });
      return _.sortBy(groups, 'fullName');
    };

    UserModel.prototype.parentGroups = function() {
      return _.filter(this.groups(), function(group) {
        return group.isParent();
      });
    };

    UserModel.prototype.allThreads = function() {
      return _.flatten(_.map(this.groups(), function(group) {
        return group.discussions();
      }));
    };

    UserModel.prototype.orphanSubgroups = function() {
      return _.filter(this.groups(), (function(_this) {
        return function(group) {
          return group.isSubgroup() && !_this.isMemberOf(group.parent());
        };
      })(this));
    };

    UserModel.prototype.isAuthorOf = function(object) {
      return this.id === object.authorId;
    };

    UserModel.prototype.isAdminOf = function(group) {
      return _.contains(group.adminIds(), this.id);
    };

    UserModel.prototype.isMemberOf = function(group) {
      return _.contains(group.memberIds(), this.id);
    };

    UserModel.prototype.firstName = function() {
      return this.name.split(' ')[0];
    };

    UserModel.prototype.lastName = function() {
      return this.name.split(' ').slice(1).join(' ');
    };

    UserModel.prototype.saveVolume = function(volume) {
      this.update({
        defaultMembershipVolume: volume
      });
      return this.recordStore.users.updateProfile(this);
    };

    return UserModel;

  })(BaseModel);
});

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('UserRecordsInterface', function(BaseRecordsInterface, UserModel, RestfulClient) {
  var UserRecordsInterface;
  return UserRecordsInterface = (function(superClass) {
    extend(UserRecordsInterface, superClass);

    function UserRecordsInterface() {
      this.deactivate = bind(this.deactivate, this);
      this.changePassword = bind(this.changePassword, this);
      this.uploadAvatar = bind(this.uploadAvatar, this);
      this.updateProfile = bind(this.updateProfile, this);
      return UserRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    UserRecordsInterface.prototype.model = UserModel;

    UserRecordsInterface.prototype.updateProfile = function(user) {
      return this.remote.post('update_profile', user.serialize());
    };

    UserRecordsInterface.prototype.uploadAvatar = function(file) {
      return this.remote.upload('upload_avatar', file);
    };

    UserRecordsInterface.prototype.changePassword = function(user) {
      return this.remote.post('change_password', user.serialize());
    };

    UserRecordsInterface.prototype.deactivate = function(user) {
      return this.remote.post('deactivate', user.serialize());
    };

    return UserRecordsInterface;

  })(BaseRecordsInterface);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('VersionModel', function(BaseModel) {
  var VersionModel;
  return VersionModel = (function(superClass) {
    extend(VersionModel, superClass);

    function VersionModel() {
      return VersionModel.__super__.constructor.apply(this, arguments);
    }

    VersionModel.singular = 'version';

    VersionModel.plural = 'versions';

    VersionModel.indices = ['discussionId'];

    VersionModel.prototype.relationships = function() {
      this.belongsTo('discussion');
      this.belongsTo('comment');
      this.belongsTo('proposal');
      return this.belongsTo('author', {
        from: 'users',
        by: 'whodunnit'
      });
    };

    VersionModel.prototype.editedAttributeNames = function() {
      return _.filter(_.keys(this.changes).sort(), function(key) {
        return _.include(['title', 'name', 'description', 'closing_at', 'private'], key);
      });
    };

    VersionModel.prototype.attributeEdited = function(name) {
      return _.include(_.keys(this.changes), name);
    };

    VersionModel.prototype.model = function() {
      return this.discussion() || this.comment();
    };

    VersionModel.prototype.isCurrent = function() {
      return this.id === _.last(this.model().versions())['id'];
    };

    VersionModel.prototype.isOriginal = function() {
      return this.id === _.first(this.model().versions())['id'];
    };

    VersionModel.prototype.authorOrEditorName = function() {
      if (this.isOriginal()) {
        return this.model().authorName();
      } else {
        return this.author().name;
      }
    };

    return VersionModel;

  })(BaseModel);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('VersionRecordsInterface', function(BaseRecordsInterface, VersionModel) {
  var VersionRecordsInterface;
  return VersionRecordsInterface = (function(superClass) {
    extend(VersionRecordsInterface, superClass);

    function VersionRecordsInterface() {
      return VersionRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    VersionRecordsInterface.prototype.model = VersionModel;

    VersionRecordsInterface.prototype.fetchByDiscussion = function(discussionKey, options) {
      if (options == null) {
        options = {};
      }
      return this.fetch({
        params: {
          model: 'discussion',
          discussion_id: discussionKey
        }
      });
    };

    VersionRecordsInterface.prototype.fetchByComment = function(commentId, options) {
      if (options == null) {
        options = {};
      }
      return this.fetch({
        params: {
          model: 'comment',
          comment_id: commentId
        }
      });
    };

    return VersionRecordsInterface;

  })(BaseRecordsInterface);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('VoteModel', function(BaseModel, AppConfig) {
  var VoteModel;
  return VoteModel = (function(superClass) {
    extend(VoteModel, superClass);

    function VoteModel() {
      return VoteModel.__super__.constructor.apply(this, arguments);
    }

    VoteModel.singular = 'vote';

    VoteModel.plural = 'votes';

    VoteModel.indices = ['id', 'proposalId'];

    VoteModel.serializableAttributes = AppConfig.permittedParams.vote;

    VoteModel.prototype.defaultValues = function() {
      return {
        statement: ''
      };
    };

    VoteModel.prototype.relationships = function() {
      this.belongsTo('author', {
        from: 'users'
      });
      return this.belongsTo('proposal');
    };

    VoteModel.prototype.authorName = function() {
      return this.author().name;
    };

    VoteModel.prototype.positionVerb = function() {
      switch (this.position) {
        case 'yes':
          return 'agree';
        case 'no':
          return 'disagree';
        default:
          return this.position;
      }
    };

    VoteModel.prototype.hasStatement = function() {
      return (this.statement != null) && this.statement.toString().length > 0;
    };

    VoteModel.prototype.anyPosition = function() {
      return this.position;
    };

    VoteModel.prototype.isAgree = function() {
      return this.position === 'yes';
    };

    VoteModel.prototype.isDisagree = function() {
      return this.position === 'no';
    };

    VoteModel.prototype.isAbstain = function() {
      return this.position === 'abstain';
    };

    VoteModel.prototype.isBlock = function() {
      return this.position === 'block';
    };

    VoteModel.prototype.charsLeft = function() {
      return 250 - (this.statement || '').toString().length;
    };

    VoteModel.prototype.overCharLimit = function() {
      return this.charsLeft() < 0;
    };

    return VoteModel;

  })(BaseModel);
});

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

angular.module('loomioApp').factory('VoteRecordsInterface', function(BaseRecordsInterface, VoteModel) {
  var VoteRecordsInterface;
  return VoteRecordsInterface = (function(superClass) {
    extend(VoteRecordsInterface, superClass);

    function VoteRecordsInterface() {
      return VoteRecordsInterface.__super__.constructor.apply(this, arguments);
    }

    VoteRecordsInterface.prototype.model = VoteModel;

    VoteRecordsInterface.prototype.fetchMyVotes = function(model) {
      var params;
      params = {};
      params[model.constructor.singular + "_id"] = model.id;
      return this.fetch({
        path: 'my_votes',
        params: params
      });
    };

    VoteRecordsInterface.prototype.fetchByProposal = function(proposal) {
      return this.fetch({
        params: {
          motion_id: proposal.id
        }
      });
    };

    return VoteRecordsInterface;

  })(BaseRecordsInterface);
});

angular.module('loomioApp').factory('AbilityService', function(AppConfig, CurrentUser) {
  var AbilityService;
  return new (AbilityService = (function() {
    function AbilityService() {}

    AbilityService.prototype.isLoggedIn = function() {
      return CurrentUser.id != null;
    };

    AbilityService.prototype.canAddComment = function(thread) {
      return CurrentUser.isMemberOf(thread.group());
    };

    AbilityService.prototype.canRespondToComment = function(comment) {
      return CurrentUser.isMemberOf(comment.group());
    };

    AbilityService.prototype.canStartProposal = function(thread) {
      return thread && !thread.hasActiveProposal() && (this.canAdministerGroup(thread.group()) || (CurrentUser.isMemberOf(thread.group()) && thread.group().membersCanRaiseMotions));
    };

    AbilityService.prototype.canEditThread = function(thread) {
      return this.canAdministerGroup(thread.group()) || CurrentUser.isMemberOf(thread.group()) && (CurrentUser.isAuthorOf(thread) || thread.group().membersCanEditDiscussions);
    };

    AbilityService.prototype.canMoveThread = function(thread) {
      return this.canAdministerGroup(thread.group()) || CurrentUser.isAuthorOf(thread);
    };

    AbilityService.prototype.canDeleteThread = function(thread) {
      return this.canAdministerGroup(thread.group()) || CurrentUser.isAuthorOf(thread);
    };

    AbilityService.prototype.canChangeThreadVolume = function(thread) {
      return CurrentUser.isMemberOf(thread.group());
    };

    AbilityService.prototype.canChangeGroupVolume = function(group) {
      return CurrentUser.isMemberOf(group);
    };

    AbilityService.prototype.canVoteOn = function(proposal) {
      return proposal.isActive() && CurrentUser.isMemberOf(proposal.group()) && (this.canAdministerGroup(proposal.group()) || proposal.group().membersCanVote);
    };

    AbilityService.prototype.canCloseOrExtendProposal = function(proposal) {
      return proposal.isActive() && (this.canAdministerGroup(proposal.group()) || CurrentUser.isAuthorOf(proposal));
    };

    AbilityService.prototype.canEditProposal = function(proposal) {
      return proposal.isActive() && proposal.canBeEdited() && (this.canAdministerGroup(proposal.group()) || (CurrentUser.isMemberOf(proposal.group()) && CurrentUser.isAuthorOf(proposal)));
    };

    AbilityService.prototype.canCreateOutcomeFor = function(proposal) {
      return this.canSetOutcomeFor(proposal) && !proposal.hasOutcome();
    };

    AbilityService.prototype.canUpdateOutcomeFor = function(proposal) {
      return this.canSetOutcomeFor(proposal) && proposal.hasOutcome();
    };

    AbilityService.prototype.canSetOutcomeFor = function(proposal) {
      return (proposal != null) && proposal.isClosed() && (CurrentUser.isAuthorOf(proposal) || this.canAdministerGroup(proposal.group()));
    };

    AbilityService.prototype.canAdministerGroup = function(group) {
      return CurrentUser.isAdminOf(group);
    };

    AbilityService.prototype.canManageGroupSubscription = function(group) {
      return this.canAdministerGroup(group) && group.subscriptionKind !== 'trial' && group.subscriptionPaymentMethod !== 'manual';
    };

    AbilityService.prototype.isCreatorOf = function(group) {
      return CurrentUser.id === group.creatorId;
    };

    AbilityService.prototype.canStartThread = function(group) {
      return group.membersCanStartDiscussions || this.canAdministerGroup(group);
    };

    AbilityService.prototype.canAddMembers = function(group) {
      return this.canAdministerGroup(group) || (CurrentUser.isMemberOf(group) && group.membersCanAddMembers);
    };

    AbilityService.prototype.canCreateSubgroups = function(group) {
      return group.isParent() && (this.canAdministerGroup(group) || (CurrentUser.isMemberOf(group) && group.membersCanCreateSubgroups));
    };

    AbilityService.prototype.canEditGroup = function(group) {
      return this.canAdministerGroup(group);
    };

    AbilityService.prototype.canArchiveGroup = function(group) {
      return this.canAdministerGroup(group);
    };

    AbilityService.prototype.canEditComment = function(comment) {
      return CurrentUser.isMemberOf(comment.group()) && CurrentUser.isAuthorOf(comment) && (comment.isMostRecent() || comment.group().membersCanEditComments);
    };

    AbilityService.prototype.canDeleteComment = function(comment) {
      return (CurrentUser.isMemberOf(comment.group()) && CurrentUser.isAuthorOf(comment)) || this.canAdministerGroup(comment.group());
    };

    AbilityService.prototype.canRemoveMembership = function(membership) {
      return membership.group().memberIds().length > 1 && (!membership.admin || membership.group().adminIds().length > 1) && (membership.user() === CurrentUser || this.canAdministerGroup(membership.group()));
    };

    AbilityService.prototype.canDeactivateUser = function() {
      return _.all(CurrentUser.memberships(), function(membership) {
        return !membership.admin || membership.group().hasMultipleAdmins;
      });
    };

    AbilityService.prototype.canManageMembershipRequests = function(group) {
      return (group.membersCanAddMembers && CurrentUser.isMemberOf(group)) || this.canAdministerGroup(group);
    };

    AbilityService.prototype.canViewGroup = function(group) {
      return !group.privacyIsSecret() || CurrentUser.isMemberOf(group);
    };

    AbilityService.prototype.canViewMemberships = function(group) {
      return CurrentUser.isMemberOf(group);
    };

    AbilityService.prototype.canViewPreviousProposals = function(group) {
      return CurrentUser.isMemberOf(group);
    };

    AbilityService.prototype.canJoinGroup = function(group) {
      return (group.membershipGrantedUpon === 'request') && this.canViewGroup(group) && !CurrentUser.isMemberOf(group);
    };

    AbilityService.prototype.canRequestMembership = function(group) {
      return (group.membershipGrantedUpon === 'approval') && this.canViewGroup(group) && !CurrentUser.isMemberOf(group) && !group.hasPendingMembershipRequestFrom(CurrentUser);
    };

    AbilityService.prototype.canTranslate = function(model) {
      return AppConfig.canTranslate && CurrentUser.locale && CurrentUser.locale !== model.author().locale;
    };

    return AbilityService;

  })());
});

angular.module('loomioApp').factory('AhoyService', function($rootScope, $location, $timeout) {
  var AhoyService;
  if (typeof ahoy !== "undefined" && ahoy !== null) {
    ahoy.trackClicks();
    ahoy.trackSubmits();
    ahoy.trackChanges();
    $rootScope.$watch(function() {
      return $location.path();
    }, function(path) {
      var properties;
      properties = {
        url: $location.absUrl(),
        title: document.title,
        page: $location.path()
      };
      return ahoy.track(properties);
    });
    $rootScope.$on('modalOpened', function(evt, modal) {
      var modalName;
      modalName = modal.templateUrl.match(/(\w+)\.html$/)[1];
      return ahoy.track('modalOpened', {
        name: modalName
      });
    });
  }
  return new (AhoyService = (function() {
    function AhoyService() {}

    AhoyService.prototype.track = function(name, options) {
      if (options == null) {
        options = {};
      }
      if (typeof ahoy !== "undefined" && ahoy !== null) {
        return ahoy.track(name, options);
      }
    };

    return AhoyService;

  })());
});

angular.module('loomioApp').factory('AnalyticsService', function($location, $rootScope, $timeout, AppConfig) {
  var AnalyticsService, service;
  AnalyticsService = (function() {
    var data;

    function AnalyticsService() {}

    data = {
      dimension4: AppConfig.version,
      dimension5: AppConfig.currentUserId,
      dimension6: 1
    };

    AnalyticsService.prototype.setVersion = function(version) {
      return data.dimension4 = version;
    };

    AnalyticsService.prototype.setUser = function(user) {
      return data.dimension5 = user.id;
    };

    AnalyticsService.prototype.setGroup = function(group) {
      data.dimension1 = group.id;
      data.dimension2 = group.organisationId;
      return data.dimension3 = group.cohortId;
    };

    AnalyticsService.prototype.clearGroup = function() {
      delete data.dimension1;
      delete data.dimension2;
      return delete data.dimension3;
    };

    AnalyticsService.prototype.trackView = function() {
      return $timeout(function() {
        data.page = $location.path();
        if (typeof ga !== "undefined" && ga !== null) {
          ga('set', data);
          return ga('send', 'pageview');
        }
      }, 2000);
    };

    return AnalyticsService;

  })();
  service = new AnalyticsService;
  $rootScope.$on('analyticsClearGroup', function() {
    return service.clearGroup();
  });
  $rootScope.$on('analyticsSetGroup', function(event, group) {
    return service.setGroup(group);
  });
  $rootScope.$watch(function() {
    return $location.path();
  }, function(path) {
    return service.trackView();
  });
  return service;
});

angular.module('loomioApp').factory('AppConfig', function() {
  var configData;
  configData = (typeof window !== "undefined" && window !== null) && (window.Loomio != null) ? window.Loomio : {
    seedRecords: {},
    permittedParams: {}
  };
  if (configData.seedRecords.users == null) {
    configData.seedRecords.users = [];
  }
  configData.seedRecords.users.push(configData.seedRecords.current_user);
  configData.isLoomioDotOrg = configData.baseUrl === 'https://www.loomio.org/';
  return configData;
});

angular.module('loomioApp').factory('BootService', function($location, Records, IntercomService, MessageChannelService, ModalService, GroupForm) {
  var BootService;
  return new (BootService = (function() {
    function BootService() {}

    BootService.prototype.boot = function() {
      IntercomService.boot();
      MessageChannelService.subscribe();
      if ($location.search().start_group != null) {
        return ModalService.open(GroupForm, {
          group: function() {
            return Records.groups.build();
          }
        });
      }
    };

    return BootService;

  })());
});

angular.module('loomioApp').factory('ChargifyService', function(CurrentUser) {
  var ChargifyService;
  return new (ChargifyService = (function() {
    function ChargifyService() {}

    ChargifyService.prototype.encodedParams = function(group) {
      var params;
      params = {
        first_name: CurrentUser.firstName(),
        last_name: CurrentUser.lastName(),
        email: CurrentUser.email,
        organization: group.name,
        reference: group.key + "|" + (moment().unix())
      };
      return _.map(_.keys(params), function(key) {
        return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
      }).join('&');
    };

    return ChargifyService;

  })());
});

angular.module('loomioApp').factory('CurrentUser', function($rootScope, Records, AppConfig) {
  Records["import"](AppConfig.seedRecords);
  if (AppConfig.currentUserId != null) {
    AppConfig.membershipsLoaded = true;
    $rootScope.$broadcast('currentUserMembershipsLoaded');
    Records.discussions.fetchInbox().then(function() {
      AppConfig.inboxLoaded = true;
      return $rootScope.$broadcast('currentUserInboxLoaded');
    });
    Records.notifications.fetchMyNotifications().then(function() {
      AppConfig.notificationsLoaded = true;
      return $rootScope.$broadcast('notificationsLoaded');
    });
    return Records.users.find(AppConfig.currentUserId);
  } else {
    return Records.users.build();
  }
});

angular.module('loomioApp').factory('DraftService', function() {
  var DraftService;
  return new (DraftService = (function() {
    function DraftService() {}

    DraftService.prototype.applyDrafting = function(scope, model) {
      var draftMode;
      draftMode = function() {
        return model[model.constructor.draftParent]() && model.isNew();
      };
      scope.storeDraft = function() {
        if (draftMode()) {
          return model.updateDraft();
        }
      };
      scope.restoreDraft = function() {
        if (draftMode()) {
          return model.restoreDraft();
        }
      };
      scope.restoreRemoteDraft = function() {
        if (draftMode()) {
          return model.fetchDraft().then(scope.restoreDraft);
        }
      };
      return scope.restoreRemoteDraft();
    };

    return DraftService;

  })());
});

angular.module('loomioApp').factory('EmojiService', function($timeout) {
  var EmojiService;
  return new (EmojiService = (function() {
    function EmojiService() {}

    EmojiService.prototype.source = window.Loomio.emojis.source;

    EmojiService.prototype.render = window.Loomio.emojis.render;

    EmojiService.prototype.defaults = window.Loomio.emojis.defaults;

    EmojiService.prototype.listen = function(scope, model, field, target) {
      return scope.$on('emojiSelected', function(event, emoji, selector) {
        var caretPosition, elem;
        if (selector !== target) {
          return;
        }
        elem = document.querySelector(selector);
        caretPosition = elem.selectionEnd;
        model[field] = (model[field].substring(0, elem.selectionEnd)) + " " + emoji + " " + (model[field].substring(elem.selectionEnd));
        return $timeout(function() {
          elem.selectionEnd = elem.selectionStart = caretPosition + emoji.length + 2;
          return elem.focus();
        });
      });
    };

    return EmojiService;

  })());
});

angular.module('loomioApp').factory('$exceptionHandler', function(AppConfig) {
  return function(exception, cause) {
    if (AppConfig.reportErrors) {
      Airbrake.push({
        error: {
          message: exception.toString(),
          stack: exception.stack
        },
        params: {
          user_id: AppConfig.currentUserId
        }
      });
    }
    return console.error("LoomioApp exception:", exception, cause);
  };
});

angular.module('loomioApp').factory('FormService', function($rootScope, FlashService, DraftService, AbilityService, $filter) {
  var FormService;
  return new (FormService = (function() {
    var calculateFlashOptions, cleanup, errorTypes, failure, prepare, success;

    function FormService() {}

    FormService.prototype.confirmDiscardChanges = function(event, record) {
      if (record.isModified() && !confirm($filter('translate')('common.confirm_discard_changes'))) {
        return event.preventDefault();
      }
    };

    errorTypes = {
      400: 'badRequest',
      401: 'unauthorizedRequest',
      403: 'forbiddenRequest',
      404: 'resourceNotFound',
      422: 'unprocessableEntity',
      500: 'internalServerError'
    };

    prepare = function(scope, model, options, prepareArgs) {
      FlashService.loading(options.loadingMessage);
      if (typeof options.prepareFn === 'function') {
        options.prepareFn(prepareArgs);
      }
      scope.isDisabled = true;
      return model.setErrors();
    };

    success = function(scope, model, options) {
      return function(response) {
        FlashService.dismiss();
        if (options.allowDrafts && AbilityService.isLoggedIn()) {
          model.resetDraft();
        }
        if (options.flashSuccess != null) {
          if (typeof options.flashSuccess === 'function') {
            options.flashSuccess = options.flashSuccess();
          }
          FlashService.success(options.flashSuccess, calculateFlashOptions(options.flashOptions));
        }
        if ((options.skipClose == null) && typeof scope.$close === 'function') {
          scope.$close();
        }
        if (typeof options.successCallback === 'function') {
          return options.successCallback(response);
        }
      };
    };

    failure = function(scope, model, options) {
      return function(response) {
        FlashService.dismiss();
        if (response.status === 422) {
          model.setErrors(response.data.errors);
        }
        return $rootScope.$broadcast(errorTypes[response.status] || 'unknownError', {
          model: model,
          response: response
        });
      };
    };

    cleanup = function(scope) {
      return function() {
        return scope.isDisabled = false;
      };
    };

    FormService.prototype.submit = function(scope, model, options) {
      var submitFn;
      if (options == null) {
        options = {};
      }
      if (options.allowDrafts && AbilityService.isLoggedIn()) {
        DraftService.applyDrafting(scope, model);
      }
      submitFn = options.submitFn || model.save;
      return function(prepareArgs) {
        prepare(scope, model, options, prepareArgs);
        return submitFn(model).then(success(scope, model, options), failure(scope, model, options))["finally"](cleanup(scope));
      };
    };

    FormService.prototype.upload = function(scope, model, options) {
      var submitFn;
      if (options == null) {
        options = {};
      }
      submitFn = options.submitFn;
      return function(files) {
        if (_.any(files)) {
          prepare(scope, model, options);
          return submitFn(files[0], options.uploadKind).then(success(scope, model, options), failure(scope, model, options))["finally"](cleanup(scope));
        }
      };
    };

    calculateFlashOptions = function(options) {
      _.each(_.keys(options), function(key) {
        if (typeof options[key] === 'function') {
          return options[key] = options[key]();
        }
      });
      return options;
    };

    return FormService;

  })());
});

angular.module('loomioApp').factory('IntercomService', function($rootScope, $window, AppConfig, CurrentUser, LmoUrlService) {
  var IntercomService, currentGroup, service;
  currentGroup = null;
  service = new (IntercomService = (function() {
    function IntercomService() {}

    IntercomService.prototype.available = function() {
      return ($window != null) && ($window.Intercom != null) && ($window.Intercom.booted != null);
    };

    IntercomService.prototype.boot = function() {
      var firstGroup;
      if (!(($window != null) && ($window.Intercom != null))) {
        return;
      }
      firstGroup = CurrentUser.parentGroups()[0];
      return $window.Intercom('boot', {
        admin_link: AppConfig.baseUrl + ("/admin/users/" + CurrentUser.id),
        app_id: AppConfig.intercomAppId,
        user_id: CurrentUser.id,
        user_hash: AppConfig.intercomUserHash,
        email: CurrentUser.email,
        name: CurrentUser.name,
        username: CurrentUser.username,
        user_id: CurrentUser.id,
        created_at: CurrentUser.createdAt,
        angular_ui: true,
        locale: CurrentUser.locale,
        company: firstGroup
      });
    };

    IntercomService.prototype.shutdown = function() {
      if (!this.available()) {
        return;
      }
      return $window.Intercom('shutdown');
    };

    IntercomService.prototype.updateWithGroup = function(group) {
      if (!this.available()) {
        return;
      }
      if (currentGroup === group) {
        return;
      }
      if (group.isSubgroup()) {
        return;
      }
      currentGroup = group;
      return $window.Intercom('update', {
        email: CurrentUser.email,
        user_id: CurrentUser.id,
        company: {
          id: group.id,
          key: group.key,
          name: group.name,
          admin_link: AppConfig.baseUrl + ("/admin/groups/" + group.key),
          subscription_kind: group.subscriptionKind,
          subscription_plan: group.subscriptionPlan,
          subscription_expires_at: group.subscriptionExpiresAt,
          creator_id: group.creatorId,
          group_privacy: group.groupPrivacy,
          cohort_id: group.cohortId,
          created_at: group.createdAt,
          locale: CurrentUser.locale,
          proposals_count: group.proposalsCount,
          discussions_count: group.discussionsCount,
          memberships_count: group.membershipsCount
        }
      });
    };

    IntercomService.prototype.contactUs = function() {
      if (this.available()) {
        return $window.Intercom.public_api.showNewMessage();
      } else {
        return $window.location = LmoUrlService.contactForm();
      }
    };

    return IntercomService;

  })());
  $rootScope.$on('analyticsSetGroup', function(event, group) {
    return service.updateWithGroup(group);
  });
  $rootScope.$on('logout', function(event, group) {
    return service.shutdown();
  });
  return service;
});

angular.module('loomioApp').factory('KeyEventService', function($rootScope) {
  var KeyEventService;
  return new (KeyEventService = (function() {
    function KeyEventService() {}

    KeyEventService.prototype.keyboardShortcuts = {
      73: 'pressedI',
      71: 'pressedG',
      84: 'pressedT',
      27: 'pressedEsc',
      13: 'pressedEnter',
      191: 'pressedSlash',
      38: 'pressedUpArrow',
      40: 'pressedDownArrow'
    };

    KeyEventService.prototype.broadcast = function(event) {
      var key;
      key = this.keyboardShortcuts[event.which];
      if (key === 'pressedEnter' || (key && !event.ctrlKey && !event.metaKey)) {
        return $rootScope.$broadcast(key, event, angular.element(document.activeElement)[0]);
      }
    };

    KeyEventService.prototype.registerKeyEvent = function(scope, eventCode, execute, shouldExecute) {
      shouldExecute = shouldExecute || this.defaultShouldExecute;
      scope.$$listeners[eventCode] = null;
      return scope.$on(eventCode, function(angularEvent, originalEvent, active) {
        if (shouldExecute(active, originalEvent)) {
          angularEvent.preventDefault() && originalEvent.preventDefault();
          return execute(active);
        }
      });
    };

    KeyEventService.prototype.defaultShouldExecute = function(active, event) {
      if (active == null) {
        active = {};
      }
      if (event == null) {
        event = {};
      }
      return !event.ctrlKey && !event.altKey && !_.contains(['INPUT', 'TEXTAREA', 'SELECT'], active.nodeName);
    };

    KeyEventService.prototype.submitOnEnter = function(scope) {
      return this.registerKeyEvent(scope, 'pressedEnter', scope.submit, (function(_this) {
        return function(active, event) {
          return (event.ctrlKey || event.metaKey) && angular.element(active).scope().$$isolateBindings === scope.$$isolateBindings && _.contains(active.classList, 'lmo-primary-form-input');
        };
      })(this));
    };

    return KeyEventService;

  })());
});

angular.module('loomioApp').factory('LmoUrlService', function(AppConfig) {
  var LmoUrlService;
  return new (LmoUrlService = (function() {
    function LmoUrlService() {}

    LmoUrlService.prototype.route = function(arg) {
      var action, model, params;
      model = arg.model, action = arg.action, params = arg.params;
      if ((model != null) && (action != null)) {
        return this[model.constructor.singular](model, {}, {
          noStub: true
        }) + this.routePath(action);
      } else if (model != null) {
        return this[model.constructor.singular](model);
      } else {
        return this.routePath(action);
      }
    };

    LmoUrlService.prototype.routePath = function(route) {
      return "/".concat(route).replace('//', '/');
    };

    LmoUrlService.prototype.group = function(g, params, options) {
      if (params == null) {
        params = {};
      }
      if (options == null) {
        options = {};
      }
      return this.buildModelRoute('g', g.key, g.fullName, params, options);
    };

    LmoUrlService.prototype.discussion = function(d, params, options) {
      if (params == null) {
        params = {};
      }
      if (options == null) {
        options = {};
      }
      return this.buildModelRoute('d', d.key, d.title, params, options);
    };

    LmoUrlService.prototype.searchResult = function(r, params, options) {
      if (params == null) {
        params = {};
      }
      if (options == null) {
        options = {};
      }
      return this.discussion(r, params, options);
    };

    LmoUrlService.prototype.user = function(u, params, options) {
      if (params == null) {
        params = {};
      }
      if (options == null) {
        options = {};
      }
      return this.buildModelRoute('u', u.username, null, params, options);
    };

    LmoUrlService.prototype.proposal = function(p, params) {
      if (params == null) {
        params = {};
      }
      return this.route({
        model: p.discussion(),
        action: "proposal/" + p.key,
        params: params
      });
    };

    LmoUrlService.prototype.comment = function(c, params) {
      if (params == null) {
        params = {};
      }
      return this.route({
        model: c.discussion(),
        action: "comment/" + c.id,
        params: params
      });
    };

    LmoUrlService.prototype.membership = function(m, params, options) {
      if (params == null) {
        params = {};
      }
      if (options == null) {
        options = {};
      }
      return this.route({
        model: m.group(),
        action: 'memberships',
        params: params
      });
    };

    LmoUrlService.prototype.membershipRequest = function(mr, params, options) {
      if (params == null) {
        params = {};
      }
      if (options == null) {
        options = {};
      }
      return this.route({
        model: mr.group(),
        action: 'membership_requests',
        params: params
      });
    };

    LmoUrlService.prototype.oauthApplication = function(a, params, options) {
      if (params == null) {
        params = {};
      }
      if (options == null) {
        options = {};
      }
      return this.buildModelRoute('apps/registered', a.id, a.name, params, options);
    };

    LmoUrlService.prototype.contactForm = function() {
      return AppConfig.baseUrl + '/contact';
    };

    LmoUrlService.prototype.buildModelRoute = function(path, key, name, params, options) {
      var result;
      result = options.absolute ? AppConfig.baseUrl : "/";
      result += path + "/" + key;
      if (!((name == null) || (options.noStub != null))) {
        result += "/" + this.stub(name);
      }
      if (options.ext != null) {
        result += "." + options.ext;
      }
      if (_.keys(params).length) {
        result += "?" + this.queryStringFor(params);
      }
      return result;
    };

    LmoUrlService.prototype.stub = function(name) {
      return name.replace(/[^a-z0-9\-_]+/gi, '-').replace(/-+/g, '-').toLowerCase();
    };

    LmoUrlService.prototype.queryStringFor = function(params) {
      if (params == null) {
        params = {};
      }
      return _.map(params, function(value, key) {
        return key + "=" + value;
      }).join('&');
    };

    return LmoUrlService;

  })());
});

var slice = [].slice;

angular.module('loomioApp').factory('LoadingService', function(Records) {
  var LoadingService;
  return new (LoadingService = (function() {
    function LoadingService() {}

    LoadingService.prototype.applyLoadingFunction = function(controller, functionName) {
      var executing, loadingFunction;
      executing = functionName + "Executing";
      loadingFunction = controller[functionName];
      return controller[functionName] = function() {
        var args;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        if (controller[executing]) {
          return;
        }
        controller[executing] = true;
        return loadingFunction.apply(null, args)["finally"](function() {
          return controller[executing] = false;
        });
      };
    };

    return LoadingService;

  })());
});

angular.module('loomioApp').factory('MessageChannelService', function($http, $rootScope, $window, Records, FlashService) {
  var MessageChannelService;
  return new (MessageChannelService = (function() {
    var handleSubscriptions;

    function MessageChannelService() {}

    MessageChannelService.prototype.subscribe = function(options) {
      if (options == null) {
        options = {};
      }
      return $http.post('/api/v1/message_channel/subscribe', options).then(handleSubscriptions);
    };

    MessageChannelService.prototype.subscribeToGroup = function(group) {
      return this.subscribe({
        group_key: group.key
      });
    };

    handleSubscriptions = function(subscriptions) {
      return _.each(subscriptions.data, function(subscription) {
        PrivatePub.sign(subscription);
        return PrivatePub.subscribe(subscription.channel, function(data) {
          var comment;
          if (data.version != null) {
            FlashService.update('global.messages.app_update', {
              version: data.version
            }, 'global.messages.reload', function() {
              return $window.location.reload();
            });
          }
          if (data.memo != null) {
            switch (data.memo.kind) {
              case 'comment_destroyed':
                if (comment = Records.comments.find(memo.data.comment_id)) {
                  comment.destroy();
                }
                break;
              case 'comment_updated':
                Records.comments["import"](memo.data.comment);
                Records["import"](memo.data);
                break;
              case 'comment_unliked':
                if (comment = Records.comments.find(memo.data.comment_id)) {
                  comment.removeLikerId(memo.data.user_id);
                }
            }
          }
          if (data.event != null) {
            if (!_.isArray(data.events)) {
              data.events = [];
            }
            data.events.push(data.event);
          }
          if (data.notification != null) {
            if (!_.isArray(data.notifications)) {
              data.notifications = [];
            }
            data.notifications.push(data.notification);
          }
          Records["import"](data);
          return $rootScope.$digest();
        });
      });
    };

    return MessageChannelService;

  })());
});

angular.module('loomioApp').factory('ModalService', function($uibModal, $rootScope, AhoyService) {
  var ModalService, currentModal;
  currentModal = null;
  return new (ModalService = (function() {
    function ModalService() {}

    ModalService.prototype.open = function(modal, resolve) {
      if (resolve == null) {
        resolve = {};
      }
      $rootScope.$broadcast('modalOpened', modal);
      if (currentModal != null) {
        currentModal.close();
      }
      return currentModal = $uibModal.open({
        templateUrl: modal.templateUrl,
        controller: modal.controller,
        resolve: resolve,
        size: modal.size || '',
        backdrop: 'static'
      });
    };

    return ModalService;

  })());
});

angular.module('loomioApp').factory('PaginationService', function(AppConfig) {
  var PaginationService;
  return new (PaginationService = (function() {
    function PaginationService() {}

    PaginationService.prototype.windowFor = function(arg) {
      var current, max, min, pageSize, pageType;
      current = arg.current, min = arg.min, max = arg.max, pageType = arg.pageType;
      pageSize = AppConfig.pageSize[pageType] || AppConfig.pageSize["default"];
      return {
        prev: current > min ? _.max([current - pageSize, min]) : void 0,
        next: current + pageSize < max ? current + pageSize : void 0,
        pageSize: pageSize
      };
    };

    return PaginationService;

  })());
});

angular.module('loomioApp').factory('PrivacyString', function($translate) {
  var PrivacyString;
  return new (PrivacyString = (function() {
    function PrivacyString() {}

    PrivacyString.prototype.groupPrivacyStatement = function(group) {
      var key;
      if (group.isSubgroup() && group.parent().privacyIsSecret()) {
        if (group.privacyIsClosed()) {
          return $translate.instant('group_form.privacy_statement.private_to_parent_members', {
            parent: group.parentName()
          });
        } else {
          return $translate.instant("group_form.privacy_statement.private_to_group");
        }
      } else {
        key = (function() {
          switch (group.groupPrivacy) {
            case 'open':
              return 'public_on_web';
            case 'closed':
              return 'public_on_web';
            case 'secret':
              return 'private_to_group';
          }
        })();
        return $translate.instant("group_form.privacy_statement." + key);
      }
    };

    PrivacyString.prototype.confirmGroupPrivacyChange = function(group) {
      var key;
      if (group.isNew()) {
        return;
      }
      key = group.attributeIsModified('groupPrivacy') ? group.privacyIsSecret() ? group.isParent() ? 'group_form.confirm_change_to_secret' : 'group_form.confirm_change_to_secret_subgroup' : group.privacyIsOpen() ? 'group_form.confirm_change_to_public' : void 0 : group.attributeIsModified('discussionPrivacyOptions') ? group.discussionPrivacyOptions === 'private_only' ? 'group_form.confirm_change_to_private_discussions_only' : void 0 : void 0;
      if (_.isString(key)) {
        return $translate.instant(key);
      } else {
        return false;
      }
    };

    PrivacyString.prototype.discussion = function(discussion, is_private) {
      var key;
      if (is_private == null) {
        is_private = null;
      }
      key = is_private === false ? 'privacy_public' : discussion.group().parentMembersCanSeeDiscussions ? 'privacy_organisation' : 'privacy_private';
      return $translate.instant("discussion_form." + key, {
        group: discussion.group().name,
        parent: discussion.group().parentName()
      });
    };

    PrivacyString.prototype.group = function(group, state) {
      var key;
      if (state == null) {
        state = null;
      }
      if (state === null) {
        state = group.groupPrivacy;
      }
      key = (function() {
        if (group.isParent()) {
          switch (state) {
            case 'open':
              return 'group_privacy_is_open_description';
            case 'secret':
              return 'group_privacy_is_secret_description';
            case 'closed':
              if (group.allowPublicDiscussions()) {
                return 'group_privacy_is_closed_public_threads_description';
              } else {
                return 'group_privacy_is_closed_description';
              }
          }
        } else {
          switch (state) {
            case 'open':
              return 'subgroup_privacy_is_open_description';
            case 'secret':
              return 'subgroup_privacy_is_secret_description';
            case 'closed':
              if (group.isSubgroupOfSecretParent()) {
                return 'subgroup_privacy_is_closed_secret_parent_description';
              } else if (group.allowPublicDiscussions()) {
                return 'subgroup_privacy_is_closed_public_threads_description';
              } else {
                return 'subgroup_privacy_is_closed_description';
              }
          }
        }
      })();
      return $translate.instant("group_form." + key, {
        parent: group.parentName()
      });
    };

    return PrivacyString;

  })());
});

angular.module('loomioApp').value('RecordStoreDatabaseName', 'default.db');

angular.module('loomioApp').factory('render', function() {
  return {
    createRenderer: function() {
      var renderer;
      renderer = new marked.Renderer();
      renderer.link = function(href, title, text) {
        return "<a href='" + href + "' title='" + (title || text) + "' target='_blank'>" + text + "</a>";
      };
      renderer.paragraph = this.cook('p');
      renderer.listitem = this.cook('li');
      renderer.tablecell = this.cook('td');
      renderer.heading = this.headerCook;
      return renderer;
    },
    headerCook: function(text, level) {
      text = emojione.shortnameToImage(text);
      return "<h" + level + ">" + text + "</h" + level + ">";
    },
    cook: function(tag) {
      return function(text) {
        text = emojione.shortnameToImage(text);
        text = text.replace(/\[\[@([a-zA-Z0-9]+)\]\]/g, "<a class='lmo-user-mention' href='/u/$1'>@$1</a>");
        return "<" + tag + ">" + text + "</" + tag + ">";
      };
    }
  };
});

angular.module('loomioApp').factory('ScrollService', function($timeout, $document) {
  var ScrollService;
  new (ScrollService = (function() {
    function ScrollService() {}

    return ScrollService;

  })());
  return {
    scrollTo: function(target, offset, speed) {
      if (offset == null) {
        offset = 50;
      }
      if (speed == null) {
        speed = 100;
      }
      return $timeout(function() {
        var elem;
        elem = document.querySelector(target);
        if (elem) {
          $document.scrollToElement(elem, offset, speed);
          return elem.focus();
        }
      });
    }
  };
});

angular.module('loomioApp').factory('ThreadQueryService', function(Records, AbilityService, CurrentUser) {
  var ThreadQueryService;
  return new (ThreadQueryService = (function() {
    var applyFilters, createBaseView, createGroupView, createTimeframeView, parseTimeOption, threadQueryFor;

    function ThreadQueryService() {}

    ThreadQueryService.prototype.filterQuery = function(filter, options) {
      if (options == null) {
        options = {};
      }
      return threadQueryFor(createBaseView(filter, options['queryType'] || 'all'));
    };

    ThreadQueryService.prototype.timeframeQuery = function(options) {
      if (options == null) {
        options = {};
      }
      return threadQueryFor(createTimeframeView(options['name'], options['filter'] || 'show_all', 'timeframe', options['timeframe']['from'], options['timeframe']['to']));
    };

    ThreadQueryService.prototype.groupQuery = function(group, options) {
      if (group == null) {
        group = {};
      }
      if (options == null) {
        options = {};
      }
      return threadQueryFor(createGroupView(group, options['filter'] || 'show_unread', options['queryType'] || 'inbox'));
    };

    threadQueryFor = function(view) {
      return {
        threads: function() {
          return view.data();
        },
        length: function() {
          return this.threads().length;
        },
        any: function() {
          return this.length() > 0;
        }
      };
    };

    createBaseView = function(filters, queryType) {
      var view;
      view = Records.discussions.collection.addDynamicView('default');
      applyFilters(view, filters, queryType);
      return view;
    };

    createGroupView = function(group, filters, queryType) {
      var view;
      view = Records.discussions.collection.addDynamicView(group.name);
      view.applyFind({
        groupId: {
          $in: group.organisationIds()
        }
      });
      applyFilters(view, filters, queryType);
      return view;
    };

    createTimeframeView = function(name, filters, queryType, from, to) {
      var today, view;
      today = moment().startOf('day');
      view = Records.discussions.collection.addDynamicView(name);
      view.applyFind({
        lastActivityAt: {
          $gt: parseTimeOption(from)
        }
      });
      view.applyFind({
        lastActivityAt: {
          $lt: parseTimeOption(to)
        }
      });
      applyFilters(view, filters, queryType);
      return view;
    };

    parseTimeOption = function(options) {
      var parts;
      parts = options.split(' ');
      return moment().startOf('day').subtract(parseInt(parts[0]), parts[1]);
    };

    applyFilters = function(view, filters, queryType) {
      filters = [].concat(filters);
      if (AbilityService.isLoggedIn()) {
        view.applyFind({
          discussionReaderId: {
            $gt: 0
          }
        });
      }
      switch (queryType) {
        case 'important':
          view.applyWhere(function(thread) {
            return thread.isImportant();
          });
          break;
        case 'timeframe':
          view.applyWhere(function(thread) {
            return !thread.isImportant();
          });
          break;
        case 'inbox':
          view.applyFind({
            lastActivityAt: {
              $gt: moment().startOf('day').subtract(6, 'week').toDate()
            }
          });
          view.applyWhere(function(thread) {
            return thread.isUnread();
          });
          filters.push('show_not_muted');
      }
      _.each(filters, function(filter) {
        switch (filter) {
          case 'show_muted':
            return view.applyWhere(function(thread) {
              return thread.volume() === 'mute';
            });
          case 'show_not_muted':
            return view.applyWhere(function(thread) {
              return thread.volume() !== 'mute';
            });
          case 'only_threads_in_my_groups':
            return view.applyFind({
              groupId: {
                $in: CurrentUser.groupIds()
              }
            });
          case 'show_participating':
            return view.applyFind({
              participating: true
            });
          case 'show_starred':
            return view.applyFind({
              starred: true
            });
          case 'show_proposals':
            return view.applyWhere(function(thread) {
              return thread.hasActiveProposal();
            });
          case 'hide_proposals':
            return view.applyWhere(function(thread) {
              return !thread.hasActiveProposal();
            });
        }
      });
      return view;
    };

    return ThreadQueryService;

  })());
});

angular.module('loomioApp').factory('TranslationService', function() {
  var TranslationService;
  return new (TranslationService = (function() {
    function TranslationService() {}

    TranslationService.prototype.listenForTranslations = function(scope, context) {
      context = context || scope;
      return scope.$on('translationComplete', (function(_this) {
        return function(e, translatedFields) {
          if (e.defaultPrevented) {
            return;
          }
          e.preventDefault();
          return context.translation = translatedFields;
        };
      })(this));
    };

    return TranslationService;

  })());
});

angular.module('loomioApp').factory('UserHelpService', function(CurrentUser) {
  var UserHelpService;
  return new (UserHelpService = (function() {
    function UserHelpService() {}

    UserHelpService.prototype.helpLocale = function() {
      switch (CurrentUser.locale) {
        case 'es':
        case 'an':
        case 'ca':
        case 'gl':
          return 'es';
        case 'zh-TW':
          return 'zh';
        case 'ar':
          return 'ar';
        default:
          return 'en';
      }
    };

    UserHelpService.prototype.helpLink = function() {
      return "https://loomio.gitbooks.io/manual/content/" + (this.helpLocale()) + "/index.html";
    };

    return UserHelpService;

  })());
});

angular.module('loomioApp').factory('ArchiveGroupForm', function() {
  return {
    templateUrl: 'generated/components/archive_group_form/archive_group_form.html',
    controller: function($scope, $rootScope, $location, group, FormService, Records) {
      $scope.group = group;
      return $scope.submit = FormService.submit($scope, $scope.group, {
        submitFn: $scope.group.archive,
        flashSuccess: 'group_page.messages.archive_group_success',
        successCallback: function() {
          return $location.path('/dashboard');
        }
      });
    }
  };
});

angular.module('loomioApp').directive('attachmentPreview', function() {
  return {
    scope: {
      attachment: '=',
      mode: '@'
    },
    restrict: 'E',
    templateUrl: 'generated/components/attachment_preview/attachment_preview.html',
    replace: true,
    controller: function($scope, $rootScope) {
      $scope.destroy = function(event) {
        $rootScope.$broadcast('attachmentRemoved', $scope.attachment.id);
        $scope.attachment.destroy();
        return event.preventDefault();
      };
      return $scope.location = function() {
        return $scope.attachment[$scope.mode];
      };
    }
  };
});

angular.module('loomioApp').controller('AuthorizedAppsPageController', function($scope, $rootScope, Records, ModalService, RevokeAppForm) {
  $rootScope.$broadcast('currentComponent', {
    page: 'authorizedAppsPage'
  });
  $rootScope.$broadcast('setTitle', 'Apps');
  this.loading = true;
  this.applications = function() {
    return Records.oauthApplications.find({
      authorized: true
    });
  };
  Records.oauthApplications.fetchAuthorized().then((function(_this) {
    return function() {
      return _this.loading = false;
    };
  })(this));
  this.openRevokeForm = function(application) {
    return ModalService.open(RevokeAppForm, {
      application: function() {
        return application;
      }
    });
  };
});

angular.module('loomioApp').factory('ChangePasswordForm', function() {
  return {
    templateUrl: 'generated/components/change_password_form/change_password_form.html',
    controller: function($scope, $rootScope, CurrentUser, Records, FormService) {
      $scope.user = CurrentUser.clone();
      return $scope.submit = FormService.submit($scope, $scope.user, {
        submitFn: Records.users.changePassword,
        flashSuccess: 'profile_page.messages.password_changed'
      });
    }
  };
});

angular.module('loomioApp').factory('ChangePictureForm', function() {
  return {
    templateUrl: 'generated/components/change_picture_form/change_picture_form.html',
    controller: function($scope, $timeout, CurrentUser, Records, FormService) {
      $scope.user = CurrentUser.clone();
      $scope.selectFile = function() {
        return $timeout(function() {
          return document.querySelector('.change-picture-form__file-input').click();
        });
      };
      $scope.submit = FormService.submit($scope, $scope.user, {
        flashSuccess: 'profile_page.messages.picture_changed',
        submitFn: Records.users.updateProfile,
        prepareFn: function(kind) {
          return $scope.user.avatarKind = kind;
        }
      });
      return $scope.upload = FormService.upload($scope, $scope.user, {
        flashSuccess: 'profile_page.messages.picture_changed',
        submitFn: Records.users.uploadAvatar,
        loadingMessage: 'common.action.uploading'
      });
    }
  };
});

angular.module('loomioApp').factory('ChangeVolumeForm', function() {
  return {
    templateUrl: 'generated/components/change_volume_form/change_volume_form.html',
    controller: function($scope, model, FormService, CurrentUser, FlashService) {
      $scope.model = model.clone();
      $scope.volumeLevels = ["loud", "normal", "quiet"];
      $scope.defaultVolume = function() {
        switch ($scope.model.constructor.singular) {
          case 'discussion':
            return $scope.model.volume();
          case 'membership':
            return $scope.model.volume;
          case 'user':
            return $scope.model.defaultMembershipVolume;
        }
      };
      $scope.buh = {
        volume: $scope.defaultVolume()
      };
      $scope.translateKey = function(key) {
        return "change_volume_form." + (key || $scope.model.constructor.singular);
      };
      $scope.flashTranslation = function() {
        var key;
        key = (function() {
          if ($scope.applyToAll) {
            switch ($scope.model.constructor.singular) {
              case 'discussion':
                return 'membership';
              case 'membership':
                return 'all_groups';
            }
          } else {
            return $scope.model.constructor.singular;
          }
        })();
        return ($scope.translateKey(key)) + ".messages." + $scope.buh.volume;
      };
      $scope.submit = FormService.submit($scope, $scope.model, {
        submitFn: function(model) {
          return model.saveVolume($scope.buh.volume, $scope.applyToAll, $scope.setDefault);
        },
        flashSuccess: $scope.flashTranslation
      });
    }
  };
});

angular.module('loomioApp').controller('ContactPageController', function($scope, UserAuthService, ContactMessageModel, ContactMessageService, FormService, CurrentUser) {
  var currentUser;
  currentUser = CurrentUser;
  $scope.message = new ContactMessageModel({
    name: currentUser.name,
    email: currentUser.email
  });
  return FormService.applyForm($scope, ContactMessageService.save, $scope.message);
});

angular.module('loomioApp').controller('DashboardPageController', function($rootScope, $scope, Records, CurrentUser, LoadingService, ThreadQueryService, AppConfig) {
  $rootScope.$broadcast('currentComponent', {
    page: 'dashboardPage'
  });
  $rootScope.$broadcast('setTitle', 'Dashboard');
  $rootScope.$broadcast('analyticsClearGroup');
  this.perPage = 50;
  this.loaded = {
    show_all: 0,
    show_muted: 0,
    show_participating: 0
  };
  this.views = {
    recent: {},
    groups: {}
  };
  this.timeframes = {
    today: {
      from: '1 second ago',
      to: '-10 year ago'
    },
    yesterday: {
      from: '1 day ago',
      to: '1 second ago'
    },
    thisweek: {
      from: '1 week ago',
      to: '1 day ago'
    },
    thismonth: {
      from: '1 month ago',
      to: '1 week ago'
    },
    older: {
      from: '3 month ago',
      to: '1 month ago'
    }
  };
  this.timeframeNames = _.map(this.timeframes, function(timeframe, name) {
    return name;
  });
  this.recentViewNames = ['proposals', 'starred', 'today', 'yesterday', 'thisweek', 'thismonth', 'older'];
  this.groupThreadLimit = 5;
  this.groups = function() {
    return CurrentUser.parentGroups();
  };
  this.moreForThisGroup = function(group) {
    return this.views.groups[group.key].length() > this.groupThreadLimit;
  };
  this.displayByGroup = function() {
    return _.contains(['show_muted'], this.filter);
  };
  this.updateQueries = (function(_this) {
    return function() {
      _this.currentBaseQuery = ThreadQueryService.filterQuery(['only_threads_in_my_groups', _this.filter]);
      if (_this.displayByGroup()) {
        return _.each(_this.groups(), function(group) {
          return _this.views.groups[group.key] = ThreadQueryService.groupQuery(group, {
            filter: _this.filter,
            queryType: 'all'
          });
        });
      } else {
        _this.views.recent.proposals = ThreadQueryService.filterQuery(['only_threads_in_my_groups', 'show_not_muted', 'show_proposals', _this.filter], {
          queryType: 'important'
        });
        _this.views.recent.starred = ThreadQueryService.filterQuery(['show_not_muted', 'show_starred', 'hide_proposals', _this.filter], {
          queryType: 'important'
        });
        return _.each(_this.timeframeNames, function(name) {
          return _this.views.recent[name] = ThreadQueryService.timeframeQuery({
            name: name,
            filter: ['only_threads_in_my_groups', 'show_not_muted', _this.filter],
            timeframe: _this.timeframes[name]
          });
        });
      }
    };
  })(this);
  this.loadMore = (function(_this) {
    return function() {
      var from;
      from = _this.loaded[_this.filter];
      _this.loaded[_this.filter] = _this.loaded[_this.filter] + _this.perPage;
      return Records.discussions.fetchDashboard({
        filter: _this.filter,
        from: from,
        per: _this.perPage
      }).then(_this.updateQueries);
    };
  })(this);
  LoadingService.applyLoadingFunction(this, 'loadMore');
  this.setFilter = (function(_this) {
    return function(filter) {
      if (filter == null) {
        filter = 'show_all';
      }
      _this.filter = filter;
      _this.updateQueries();
      if (_this.loaded[_this.filter] === 0) {
        return _this.loadMore();
      }
    };
  })(this);
  this.setFilter();
  $scope.$on('currentUserMembershipsLoaded', (function(_this) {
    return function() {
      return _this.setFilter();
    };
  })(this));
  $scope.$on('homePageClicked', (function(_this) {
    return function() {
      return _this.setFilter();
    };
  })(this));
});

angular.module('loomioApp').factory('DeactivateUserForm', function() {
  return {
    templateUrl: 'generated/components/deactivate_user_form/deactivate_user_form.html',
    controller: function($scope, $rootScope, $window, CurrentUser, Records, FormService) {
      $scope.user = CurrentUser.clone();
      return $scope.submit = FormService.submit($scope, $scope.user, {
        submitFn: Records.users.deactivate,
        successCallback: function() {
          return $window.location.reload();
        }
      });
    }
  };
});

angular.module('loomioApp').factory('DeleteThreadForm', function() {
  return {
    templateUrl: 'generated/components/delete_thread_form/delete_thread_form.html',
    controller: function($scope, $location, discussion, FormService, LmoUrlService) {
      $scope.discussion = discussion;
      $scope.group = discussion.group();
      return $scope.submit = FormService.submit($scope, $scope.discussion, {
        submitFn: $scope.discussion.destroy,
        flashSuccess: 'delete_thread_form.messages.success',
        successCallback: function() {
          return $location.path(LmoUrlService.group($scope.group));
        }
      });
    }
  };
});

angular.module('loomioApp').factory('DiscussionForm', function() {
  return {
    templateUrl: 'generated/components/discussion_form/discussion_form.html',
    controller: function($scope, $controller, $location, discussion, CurrentUser, Records, AbilityService, FormService, KeyEventService, PrivacyString, EmojiService) {
      var actionName;
      $scope.discussion = discussion.clone();
      if ($scope.discussion.isNew()) {
        $scope.showGroupSelect = true;
      }
      actionName = $scope.discussion.isNew() ? 'created' : 'updated';
      $scope.submit = FormService.submit($scope, $scope.discussion, {
        flashSuccess: "discussion_form.messages." + actionName,
        allowDrafts: true,
        successCallback: (function(_this) {
          return function(response) {
            if (actionName === 'created') {
              return $location.path("/d/" + response.discussions[0].key);
            }
          };
        })(this)
      });
      $scope.availableGroups = function() {
        return _.filter(CurrentUser.groups(), function(group) {
          return AbilityService.canStartThread(group);
        });
      };
      $scope.restoreDraft = function() {
        if (!(($scope.discussion.group() != null) && $scope.discussion.isNew())) {
          return;
        }
        $scope.discussion.restoreDraft();
        return $scope.updatePrivacy();
      };
      $scope.privacyPrivateDescription = function() {
        return PrivacyString.discussion($scope.discussion, true);
      };
      $scope.updatePrivacy = function() {
        return $scope.discussion["private"] = $scope.discussion.privateDefaultValue();
      };
      $scope.showPrivacyForm = function() {
        if (!$scope.discussion.group()) {
          return;
        }
        return $scope.discussion.group().discussionPrivacyOptions === 'public_or_private';
      };
      $scope.descriptionSelector = '.discussion-form__description-input';
      EmojiService.listen($scope, $scope.discussion, 'description', $scope.descriptionSelector);
      return KeyEventService.submitOnEnter($scope);
    }
  };
});

angular.module('loomioApp').controller('EmailSettingsPageController', function(Records, FormService, CurrentUser, $location, ModalService, ChangeVolumeForm) {
  this.user = CurrentUser.clone();
  this.groupVolume = function(group) {
    return group.membershipFor(CurrentUser).volume;
  };
  this.changeDefaultMembershipVolume = function() {
    return ModalService.open(ChangeVolumeForm, {
      model: (function(_this) {
        return function() {
          return CurrentUser;
        };
      })(this)
    });
  };
  this.editSpecificGroupVolume = function(group) {
    return ModalService.open(ChangeVolumeForm, {
      model: (function(_this) {
        return function() {
          return group.membershipFor(CurrentUser);
        };
      })(this)
    });
  };
  this.submit = FormService.submit(this, this.user, {
    submitFn: Records.users.updateProfile,
    flashSuccess: 'email_settings_page.messages.updated',
    successCallback: function() {
      return $location.path('/dashboard');
    }
  });
});

angular.module('loomioApp').directive('emojiPicker', function() {
  return {
    scope: {
      targetSelector: '='
    },
    restrict: 'E',
    replace: true,
    templateUrl: 'generated/components/emoji_picker/emoji_picker.html',
    controller: function($scope, $timeout, EmojiService, KeyEventService) {
      $scope.render = EmojiService.render;
      $scope.search = function(term) {
        $scope.hovered = {};
        return $scope.source = term ? _.take(_.filter(EmojiService.source, function(emoji) {
          return emoji.match(RegExp("^:" + term, "i"));
        }), 15) : EmojiService.defaults;
      };
      $scope.search();
      $scope.toggleMenu = function() {
        $scope.showMenu = !$scope.showMenu;
        $scope.search();
        return $timeout(function() {
          if ($scope.showMenu) {
            return document.querySelector('.emoji-picker__search').focus();
          }
        });
      };
      $scope.hideMenu = function() {
        if (!$scope.showMenu) {
          return;
        }
        $scope.hovered = {};
        $scope.term = '';
        return $scope.toggleMenu();
      };
      KeyEventService.registerKeyEvent($scope, 'pressedEsc', $scope.toggleMenu, function() {
        return $scope.showMenu;
      });
      $scope.hover = function(emoji) {
        return $scope.hovered = {
          name: emoji,
          image: $scope.render(emoji)
        };
      };
      $scope.select = function(emoji) {
        $scope.$emit('emojiSelected', emoji, $scope.targetSelector);
        return $scope.hideMenu();
      };
      return $scope.noEmojisFound = function() {
        return $scope.source.length === 0;
      };
    }
  };
});

angular.module('loomioApp').directive('errorPage', function() {
  return {
    scope: {
      error: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/error_page/error_page.html',
    replace: true
  };
});

angular.module('loomioApp').directive('flash', function(AppConfig) {
  return {
    restrict: 'E',
    templateUrl: 'generated/components/flash/flash.html',
    replace: true,
    controllerAs: 'flash',
    controller: function($scope, $interval, FlashService) {
      $scope.pendingDismiss = null;
      $scope.$on('flashMessage', (function(_this) {
        return function(event, flash) {
          $scope.flash = _.merge(flash, {
            visible: true
          });
          if ($scope.loading()) {
            $scope.flash.message = $scope.flash.message || 'common.action.loading';
          }
          if ($scope.pendingDismiss != null) {
            $interval.cancel($scope.pendingDismiss);
          }
          return $scope.pendingDismiss = $interval($scope.dismiss, flash.duration, 1);
        };
      })(this));
      $scope.$on('dismissFlash', $scope.dismiss);
      $scope.loading = function() {
        return $scope.flash.level === 'loading';
      };
      $scope.display = function() {
        return $scope.flash.visible;
      };
      $scope.dismiss = function() {
        return $scope.flash.visible = false;
      };
      $scope.ariaLive = function() {
        if ($scope.loading()) {
          return 'polite';
        } else {
          return 'assertive';
        }
      };
      if (AppConfig.flash.success != null) {
        FlashService.success(AppConfig.flash.success);
      }
      if (AppConfig.flash.notice != null) {
        FlashService.info(AppConfig.flash.notice);
      }
      if (AppConfig.flash.warning != null) {
        FlashService.warning(AppConfig.flash.warning);
      }
      if (AppConfig.flash.error != null) {
        FlashService.error(AppConfig.flash.error);
      }
    }
  };
});

angular.module('loomioApp').factory('FlashService', function($rootScope) {
  var FlashService;
  return new (FlashService = (function() {
    var LONG_TIME, SHORT_TIME, createFlashLevel;

    function FlashService() {}

    SHORT_TIME = 3500;

    LONG_TIME = 2147483645;

    createFlashLevel = function(level, duration) {
      return function(translateKey, translateValues, actionKey, actionFn) {
        return $rootScope.$broadcast('flashMessage', {
          level: level,
          duration: duration || SHORT_TIME,
          message: translateKey,
          options: translateValues,
          action: actionKey,
          actionFn: actionFn
        });
      };
    };

    FlashService.prototype.success = createFlashLevel('success');

    FlashService.prototype.info = createFlashLevel('info');

    FlashService.prototype.warning = createFlashLevel('warning');

    FlashService.prototype.error = createFlashLevel('error');

    FlashService.prototype.loading = createFlashLevel('loading', LONG_TIME);

    FlashService.prototype.update = createFlashLevel('update', LONG_TIME);

    FlashService.prototype.dismiss = createFlashLevel('loading', 1);

    return FlashService;

  })());
});

angular.module('loomioApp').directive('formErrors', function() {
  return {
    scope: {
      model: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/form_errors/form_errors.html',
    replace: true,
    controller: 'FormErrorsController'
  };
});

angular.module('loomioApp').controller('FormErrorsController', function() {});

angular.module('loomioApp').directive('groupAvatar', function() {
  return {
    scope: {
      group: '=',
      size: '@?'
    },
    restrict: 'E',
    templateUrl: 'generated/components/group_avatar/group_avatar.html',
    replace: true,
    controller: function($scope) {
      var sizes;
      sizes = ['small', 'medium', 'large'];
      if (!_.contains(sizes, $scope.size)) {
        return $scope.size = 'small';
      }
    }
  };
});

angular.module('loomioApp').factory('GroupForm', function() {
  return {
    templateUrl: 'generated/components/group_form/group_form.html',
    controller: function($scope, $rootScope, $location, group, FormService, Records, $translate, PrivacyString) {
      var submitForm, successMessage;
      $scope.group = group.clone();
      $scope.i18n = (function() {
        var groupMessaging;
        groupMessaging = {};
        if ($scope.group.isParent()) {
          groupMessaging.group_name = 'group_form.group_name';
          if ($scope.group.isNew()) {
            groupMessaging.heading = 'group_form.start_group_heading';
            groupMessaging.submit = 'group_form.submit_start_group';
          } else {
            groupMessaging.heading = 'group_form.edit_group_heading';
            groupMessaging.submit = 'common.action.update_settings';
          }
        } else {
          groupMessaging.group_name = 'group_form.subgroup_name';
          if ($scope.group.isNew()) {
            groupMessaging.heading = 'group_form.start_subgroup_heading';
            groupMessaging.submit = 'group_form.submit_start_subgroup';
          } else {
            groupMessaging.heading = 'group_form.edit_subgroup_heading';
            groupMessaging.submit = 'common.action.update_settings';
          }
        }
        return groupMessaging;
      })();
      successMessage = function() {
        if ($scope.group.isNew()) {
          return 'group_form.messages.group_created';
        } else {
          return 'group_form.messages.group_updated';
        }
      };
      submitForm = FormService.submit($scope, $scope.group, {
        allowDrafts: true,
        flashSuccess: successMessage(),
        successCallback: function(response) {
          if ($scope.group.isNew()) {
            return $location.path("/g/" + response.groups[0].key);
          }
        }
      });
      $scope.submit = function() {
        var message;
        if (message = PrivacyString.confirmGroupPrivacyChange($scope.group)) {
          if (window.confirm(message)) {
            return submitForm();
          }
        } else {
          return submitForm();
        }
      };
      $scope.expandForm = function() {
        return $scope.expanded = true;
      };
      $scope.privacyStatement = function() {
        return PrivacyString.groupPrivacyStatement($scope.group);
      };
      $scope.privacyStringFor = function(state) {
        return PrivacyString.group($scope.group, state);
      };
      $scope.buh = {};
      $scope.buh.allowPublicThreads = $scope.group.allowPublicDiscussions();
      $scope.allowPublicThreadsClicked = function() {
        if ($scope.buh.allowPublicThreads) {
          return $scope.group.discussionPrivacyOptions = 'public_or_private';
        } else {
          return $scope.group.discussionPrivacyOptions = 'private_only';
        }
      };
      return $scope.groupPrivacyChanged = function() {
        $scope.group.parentMembersCanSeeDiscussions = !$scope.group.privacyIsSecret();
        switch ($scope.group.groupPrivacy) {
          case 'open':
            return $scope.group.discussionPrivacyOptions = 'public_only';
          case 'closed':
            return $scope.allowPublicThreadsClicked();
          case 'secret':
            return $scope.group.discussionPrivacyOptions = 'private_only';
        }
      };
    }
  };
});

angular.module('loomioApp').controller('GroupPageController', function($rootScope, $location, $routeParams, Records, CurrentUser, MessageChannelService, AbilityService, AppConfig, LmoUrlService, PaginationService, ModalService, SubscriptionSuccessModal, GroupWelcomeModal, LegacyTrialExpiredModal) {
  $rootScope.$broadcast('currentComponent', {
    page: 'groupPage'
  });
  $routeParams.key = $routeParams.key.split('|')[0];
  Records.groups.findOrFetchById($routeParams.key).then((function(_this) {
    return function(group) {
      _this.group = group;
      if (AbilityService.isLoggedIn()) {
        if (_this.group.trialIsOverdue()) {
          $rootScope.$broadcast('trialIsOverdue', _this.group);
        }
        MessageChannelService.subscribeToGroup(_this.group);
        Records.drafts.fetchFor(_this.group);
        _this.handleSubscriptionSuccess();
        _this.handleWelcomeModal();
        LegacyTrialExpiredModal.showIfAppropriate(_this.group, CurrentUser);
      }
      _this.pageWindow = PaginationService.windowFor({
        current: parseInt($location.search().from || 0),
        min: 0,
        max: _this.group.publicDiscussionsCount,
        pageType: 'groupThreads'
      });
      $rootScope.$broadcast('viewingGroup', _this.group);
      $rootScope.$broadcast('setTitle', _this.group.fullName);
      $rootScope.$broadcast('analyticsSetGroup', _this.group);
      return $rootScope.$broadcast('currentComponent', {
        page: 'groupPage',
        links: {
          canonical: LmoUrlService.group(_this.group, {}, {
            absolute: true
          }),
          rss: !_this.group.privacyIsSecret() ? LmoUrlService.group(_this.group, {}, {
            absolute: true,
            ext: 'xml'
          }) : void 0,
          prev: _this.pageWindow.prev != null ? LmoUrlService.group(_this.group, {
            from: _this.pageWindow.prev
          }) : void 0,
          next: _this.pageWindow.next != null ? LmoUrlService.group(_this.group, {
            from: _this.pageWindow.next
          }) : void 0
        }
      });
    };
  })(this), function(error) {
    return $rootScope.$broadcast('pageError', error);
  });
  this.showDescriptionPlaceholder = function() {
    return !this.group.description;
  };
  this.canManageMembershipRequests = function() {
    return AbilityService.canManageMembershipRequests(this.group);
  };
  this.canUploadPhotos = function() {
    return AbilityService.canAdministerGroup(this.group);
  };
  this.openUploadCoverForm = function() {
    return ModalService.open(CoverPhotoForm, {
      group: (function(_this) {
        return function() {
          return _this.group;
        };
      })(this)
    });
  };
  this.openUploadLogoForm = function() {
    return ModalService.open(LogoPhotoForm, {
      group: (function(_this) {
        return function() {
          return _this.group;
        };
      })(this)
    });
  };
  this.handleSubscriptionSuccess = function() {
    if ((AppConfig.chargify || AppConfig.environment === 'development') && ($location.search().chargify_success != null)) {
      this.subscriptionSuccess = true;
      this.group.subscriptionKind = 'paid';
      $location.search('chargify_success', null);
      return ModalService.open(SubscriptionSuccessModal);
    }
  };
  this.showWelcomeModel = function() {
    return this.group.isParent() && AbilityService.isCreatorOf(this.group) && this.group.noInvitationsSent() && !this.group.trialIsOverdue() && !this.subscriptionSuccess && !GroupWelcomeModal.shownToGroup[this.group.id];
  };
  this.handleWelcomeModal = (function(_this) {
    return function() {
      if (_this.showWelcomeModel()) {
        GroupWelcomeModal.shownToGroup[_this.group.id] = true;
        return ModalService.open(GroupWelcomeModal);
      }
    };
  })(this);
});

angular.module('loomioApp').controller('GroupsPageController', function($rootScope, CurrentUser, Records, LoadingService, GroupForm, ModalService) {
  $rootScope.$broadcast('currentComponent', {
    page: 'groupsPage'
  });
  $rootScope.$broadcast('setTitle', 'Groups');
  this.parentGroups = (function(_this) {
    return function() {
      return _.unique(_.compact(_.map(CurrentUser.memberships(), function(membership) {
        if (membership.group().isParent()) {
          return membership.group();
        } else if (!CurrentUser.isMemberOf(membership.group().parent())) {
          return membership.group().parent();
        }
      })));
    };
  })(this);
  this.startGroup = function() {
    return ModalService.open(GroupForm, {
      group: function() {
        return Records.groups.build();
      }
    });
  };
});

angular.module('loomioApp').directive('h1', function() {
  return {
    restrict: 'E',
    link: function(scope, elem, attrs) {
      return elem.attr('tabindex', 0);
    }
  };
});

angular.module('loomioApp').directive('i', function() {
  return {
    restrict: 'E',
    link: function(scope, elem, attrs) {
      return elem.attr('aria-hidden', 'true');
    }
  };
});

angular.module('loomioApp').directive('invitable', function() {
  return {
    scope: {
      invitable: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/invitation_form/invitable.html',
    replace: true,
    controller: function($scope) {
      $scope.match = {
        label: $scope.invitable
      };
    }
  };
});

angular.module('loomioApp').factory('InvitationForm', function() {
  return {
    templateUrl: 'generated/components/invitation_form/invitation_form.html',
    controller: function($scope, group, Records, CurrentUser, AbilityService, FormService, FlashService, RestfulClient, ModalService, AddMembersModal) {
      var submitForm;
      $scope.availableGroups = function() {
        return _.filter(CurrentUser.groups(), function(group) {
          return AbilityService.canAddMembers(group);
        });
      };
      $scope.form = Records.invitationForms.build({
        groupId: group.id || (_.first($scope.availableGroups()) || {}).id
      });
      $scope.fetchShareableInvitation = function() {
        return Records.invitations.fetchShareableInvitationByGroupId($scope.form.group().id);
      };
      $scope.fetchShareableInvitation();
      $scope.showCustomMessageField = false;
      $scope.isDisabled = false;
      $scope.noInvitations = false;
      $scope.addMembers = function() {
        return ModalService.open(AddMembersModal, {
          group: function() {
            return $scope.form.group();
          }
        });
      };
      $scope.showCustomMessageField = function() {
        return $scope.addCustomMessageClicked || $scope.form.message;
      };
      $scope.addCustomMessage = function() {
        return $scope.addCustomMessageClicked = true;
      };
      $scope.invitees = function() {
        return $scope.form.emails.match(/[^\s,;<>]+?@[^\s,;<>]+\.[^\s,;<>]+/g) || [];
      };
      $scope.maxInvitations = function() {
        return $scope.invitees().length > 100;
      };
      $scope.submitText = function() {
        if ($scope.form.emails.length > 0) {
          return 'invitation_form.send';
        } else {
          return 'invitation_form.done';
        }
      };
      $scope.invalidEmail = function() {
        return $scope.invitees().length === 0 && $scope.form.emails.length > 0;
      };
      $scope.canSubmit = function() {
        return $scope.invitees().length > 0 && $scope.form.group();
      };
      $scope.copied = function() {
        return FlashService.success('common.copied');
      };
      $scope.invitationLink = function() {
        if (!($scope.form.group() && $scope.form.group().shareableInvitation())) {
          return;
        }
        return $scope.form.group().shareableInvitation().url;
      };
      $scope.submit = function() {
        if ($scope.invitees().length === 0) {
          return $scope.$close();
        } else {
          return submitForm();
        }
      };
      submitForm = FormService.submit($scope, $scope.form, {
        allowDrafts: true,
        submitFn: Records.invitations.sendByEmail,
        successCallback: (function(_this) {
          return function(response) {
            var invitationCount;
            invitationCount = response.invitations.length;
            switch (invitationCount) {
              case 0:
                return $scope.noInvitations = true;
              case 1:
                return FlashService.success('invitation_form.messages.invitation_sent');
              default:
                return FlashService.success('invitation_form.messages.invitations_sent', {
                  count: invitationCount
                });
            }
          };
        })(this)
      });
    }
  };
});

var shownToGroup;

shownToGroup = {};

angular.module('loomioApp').factory('LegacyTrialExpiredModal', function(ModalService, AppConfig, AhoyService) {
  return {
    appropriateToShow: function(group, user) {
      return user.isAdminOf(group) && group.showLegacyTrialExpiredModal;
    },
    showIfAppropriate: function(group, user) {
      if (!this.appropriateToShow(group, user)) {
        return false;
      }
      shownToGroup[group.id] = true;
      return ModalService.open(this, {
        group: function() {
          return group;
        }
      });
    },
    templateUrl: 'generated/components/legacy_trial_expired_modal/legacy_trial_expired_modal.html',
    controller: function($scope, group, ChoosePlanModal, ModalService) {
      return $scope.submit = function() {
        AhoyService.track('legacy-trial-expired-modal__submit clicked');
        return ModalService.open(ChoosePlanModal, {
          group: function() {
            return group;
          }
        });
      };
    }
  };
});

angular.module('loomioApp').factory('LeaveGroupForm', function() {
  return {
    templateUrl: 'generated/components/leave_group_form/leave_group_form.html',
    controller: function($scope, $location, $rootScope, group, FormService, CurrentUser, AbilityService) {
      $scope.group = group;
      $scope.membership = $scope.group.membershipFor(CurrentUser);
      $scope.submit = FormService.submit($scope, $scope.group, {
        submitFn: $scope.membership.destroy,
        flashSuccess: 'group_page.messages.leave_group_success',
        successCallback: function() {
          $rootScope.$broadcast('currentUserMembershipsLoaded');
          return $location.path('/dashboard');
        }
      });
      return $scope.canLeaveGroup = function() {
        return AbilityService.canRemoveMembership($scope.membership);
      };
    }
  };
});

angular.module('loomioApp').controller('InboxPageController', function($scope, $rootScope, Records, CurrentUser, AppConfig, LoadingService, ThreadQueryService) {
  var filters;
  $rootScope.$broadcast('currentComponent', {
    page: 'inboxPage'
  });
  $rootScope.$broadcast('setTitle', 'Inbox');
  $rootScope.$broadcast('analyticsClearGroup');
  filters = ['only_threads_in_my_groups', 'show_unread', 'show_not_muted'];
  this.threadLimit = 50;
  this.views = {
    groups: {}
  };
  this.loading = function() {
    return !(AppConfig.inboxLoaded && AppConfig.membershipsLoaded);
  };
  this.groups = function() {
    return _.flatten([CurrentUser.parentGroups(), CurrentUser.orphanSubgroups()]);
  };
  this.init = (function(_this) {
    return function() {
      if (_this.loading()) {
        return;
      }
      return _.each(_this.groups(), function(group) {
        return _this.views.groups[group.key] = ThreadQueryService.groupQuery(group, {
          filter: filters
        });
      });
    };
  })(this);
  $scope.$on('currentUserMembershipsLoaded', this.init);
  $scope.$on('currentUserInboxLoaded', this.init);
  this.init();
  this.hasThreads = function() {
    return ThreadQueryService.filterQuery(filters, {
      queryType: 'inbox'
    }).any();
  };
  this.moreForThisGroup = function(group) {
    return this.views.groups[group.key].length() > this.threadLimit;
  };
});

angular.module('loomioApp').directive('lmoHref', function() {
  return {
    restrict: 'A',
    scope: {
      route: '@lmoHref'
    },
    link: function(scope, elem, attrs) {
      scope.$watch('route', function() {
        return elem.attr('href', scope.route);
      });
      return elem.bind('click', function($event) {
        if ($event.ctrlKey || $event.metaKey) {
          return $event.stopImmediatePropagation();
        }
      });
    }
  };
});

angular.module('loomioApp').directive('lmoHrefFor', function(LmoUrlService) {
  return {
    restrict: 'A',
    scope: {
      model: '=lmoHrefFor',
      action: '@lmoHrefAction'
    },
    link: function(scope, elem, attrs) {
      elem.attr('href', LmoUrlService.route({
        model: scope.model,
        action: scope.action
      }));
      return elem.bind('click', function($event) {
        var attr_target;
        attr_target = $event.target.attributes.target;
        if ($event.ctrlKey || $event.metaKey || (attr_target && attr_target.value === '_blank')) {
          return $event.stopImmediatePropagation();
        }
      });
    }
  };
});

angular.module('loomioApp').directive('loading', function() {
  return {
    scope: {},
    restrict: 'E',
    templateUrl: 'generated/components/loading/loading.html',
    replace: true
  };
});

angular.module('loomioApp').controller('MembershipRequestsPageController', function($routeParams, $rootScope, Records, LoadingService, AbilityService, FlashService, AppConfig) {
  $rootScope.$broadcast('currentComponent', {
    page: 'membershipRequestsPage'
  });
  this.init = (function(_this) {
    return function() {
      return Records.groups.findOrFetchById($routeParams.key).then(function(group) {
        if (AbilityService.canManageMembershipRequests(group)) {
          _this.group = group;
          Records.membershipRequests.fetchPendingByGroup(group.key, {
            per: 100
          });
          return Records.membershipRequests.fetchPreviousByGroup(group.key, {
            per: 100
          });
        } else {
          return $rootScope.$broadcast('pageError', {
            status: 403
          });
        }
      }, function(error) {
        return $rootScope.$broadcast('pageError', {
          status: 403
        });
      });
    };
  })(this);
  this.init();
  this.pendingRequests = (function(_this) {
    return function() {
      return _this.group.pendingMembershipRequests();
    };
  })(this);
  this.previousRequests = (function(_this) {
    return function() {
      return _this.group.previousMembershipRequests();
    };
  })(this);
  this.approve = (function(_this) {
    return function(membershipRequest) {
      return Records.membershipRequests.approve(membershipRequest).then(function() {
        return FlashService.success("membership_requests_page.messages.request_approved_success");
      });
    };
  })(this);
  this.ignore = (function(_this) {
    return function(membershipRequest) {
      return Records.membershipRequests.ignore(membershipRequest).then(function() {
        return FlashService.success("membership_requests_page.messages.request_ignored_success");
      });
    };
  })(this);
  this.noPendingRequests = (function(_this) {
    return function() {
      return _this.pendingRequests.length === 0;
    };
  })(this);
});

angular.module('loomioApp').controller('MembershipsPageController', function($routeParams, $rootScope, Records, LoadingService, ModalService, InvitationForm, RemoveMembershipForm, AbilityService, FlashService, ScrollService) {
  var filteredMemberships;
  $rootScope.$broadcast('currentComponent', {
    page: 'membershipsPage'
  });
  this.init = (function(_this) {
    return function(group) {
      if ((_this.group != null) || (group == null)) {
        return;
      }
      if (AbilityService.canViewMemberships(group)) {
        _this.group = group;
        return Records.memberships.fetchByGroup(_this.group.key, {
          per: 100
        }).then(function() {
          if ($routeParams.username != null) {
            return ScrollService.scrollTo("[data-username=" + $routeParams.username + "]");
          }
        });
      } else {
        return $rootScope.$broadcast('pageError', {
          status: 403
        }, group);
      }
    };
  })(this);
  this.fetchMemberships = (function(_this) {
    return function() {
      if (_this.fragment) {
        return Records.memberships.fetchByNameFragment(_this.fragment, _this.group.key);
      }
    };
  })(this);
  this.canAdministerGroup = function() {
    return AbilityService.canAdministerGroup(this.group);
  };
  this.canAddMembers = function() {
    return AbilityService.canAddMembers(this.group);
  };
  this.canRemoveMembership = function(membership) {
    return AbilityService.canRemoveMembership(membership);
  };
  this.canToggleAdmin = function(membership) {
    return this.canAdministerGroup(membership) && (!membership.admin || this.canRemoveMembership(membership));
  };
  this.toggleAdmin = function(membership) {
    var method;
    method = membership.admin ? 'makeAdmin' : 'removeAdmin';
    return Records.memberships[method](membership).then(function() {
      return FlashService.success("memberships_page.messages." + (_.snakeCase(method)) + "_success", {
        name: membership.userName()
      });
    });
  };
  this.openRemoveForm = function(membership) {
    return ModalService.open(RemoveMembershipForm, {
      membership: function() {
        return membership;
      }
    });
  };
  this.invitePeople = function() {
    return ModalService.open(InvitationForm, {
      group: (function(_this) {
        return function() {
          return _this.group;
        };
      })(this)
    });
  };
  filteredMemberships = (function(_this) {
    return function() {
      if (_this.fragment) {
        return _.filter(_this.group.memberships(), function(membership) {
          return _.contains(membership.userName().toLowerCase(), _this.fragment.toLowerCase());
        });
      } else {
        return _this.group.memberships();
      }
    };
  })(this);
  this.memberships = function() {
    return _.sortBy(filteredMemberships(), function(membership) {
      return membership.userName();
    });
  };
  this.name = function(membership) {
    return membership.userName();
  };
  Records.groups.findOrFetchById($routeParams.key).then(this.init, function(error) {
    return $rootScope.$broadcast('pageError', error);
  });
});

angular.module('loomioApp').directive('modalHeaderCancelButton', function() {
  return {
    restrict: 'E',
    templateUrl: 'generated/components/modal_header_cancel_button/modal_header_cancel_button.html',
    replace: true
  };
});

angular.module('loomioApp').controller('NotificationController', function($scope, LmoUrlService, Records) {
  $scope.event = $scope.notification.event();
  $scope.actor = $scope.event.actor();
  $scope.link = function() {
    switch ($scope.event.kind) {
      case 'comment_liked':
        return LmoUrlService.comment($scope.event.comment());
      case 'comment_replied_to':
        return LmoUrlService.comment($scope.event.comment());
      case 'motion_closing_soon':
        return LmoUrlService.proposal($scope.event.proposal());
      case 'motion_outcome_created':
        return LmoUrlService.proposal($scope.event.proposal());
      case 'user_mentioned':
        return LmoUrlService.comment($scope.event.comment());
      case 'membership_requested':
        return LmoUrlService.route({
          model: $scope.event.membershipRequest().group(),
          action: 'membership_requests'
        });
      case 'user_added_to_group':
        return LmoUrlService.group($scope.event.membership().group());
      case 'membership_request_approved':
        return LmoUrlService.group($scope.event.membership().group());
    }
  };
});

angular.module('loomioApp').directive('notifications', function() {
  return {
    scope: {},
    restrict: 'E',
    templateUrl: 'generated/components/notifications/notifications.html',
    replace: true,
    controller: function($scope, $rootScope, Records, AppConfig) {
      var eventFilter, kinds, notificationsView, unreadView;
      kinds = ['comment_liked', 'motion_closing_soon', 'comment_replied_to', 'user_mentioned', 'membership_requested', 'membership_request_approved', 'user_added_to_group', 'motion_closed', 'motion_closing_soon', 'motion_outcome_created', 'invitation_accepted', 'new_coordinator'];
      eventFilter = function(notification) {
        return _.contains(kinds, notification.event().kind);
      };
      notificationsView = Records.notifications.collection.addDynamicView("notifications").applyWhere(eventFilter);
      $scope.notifications = function() {
        return notificationsView.data();
      };
      unreadView = Records.notifications.collection.addDynamicView("unread").applyWhere(eventFilter).applyFind({
        viewed: {
          $ne: true
        }
      });
      $scope.unreadNotifications = function() {
        return unreadView.data();
      };
      $scope.broadcastThreadEvent = function(notification) {
        return $rootScope.$broadcast('threadPageEventsLoaded', notification.event());
      };
      $scope.loading = function() {
        return !AppConfig.notificationsLoaded;
      };
      $scope.toggled = function(open) {
        if (open) {
          return Records.notifications.viewed();
        }
      };
      $scope.unreadCount = (function(_this) {
        return function() {
          return $scope.unreadNotifications().length;
        };
      })(this);
      $scope.hasUnread = (function(_this) {
        return function() {
          return $scope.unreadCount() > 0;
        };
      })(this);
    }
  };
});

angular.module('loomioApp').directive('outlet', function($compile) {
  return {
    restrict: 'E',
    replace: true,
    link: function(scope, elem, attrs) {
      return _.map(window.Loomio.plugins.outlets[_.snakeCase(attrs.name)], function(outlet) {
        return elem.append($compile("<" + (_.snakeCase(outlet.component)) + " />")(scope));
      });
    }
  };
});

angular.module('loomioApp').directive('pieWithPosition', function() {
  return {
    scope: {
      proposal: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/pie_with_position/pie_with_position.html',
    replace: true,
    controller: function($scope, CurrentUser) {
      return $scope.lastVoteByCurrentUser = function(proposal) {
        return proposal.lastVoteByUser(CurrentUser);
      };
    }
  };
});

angular.module('loomioApp').directive('pieChart', function() {
  return {
    template: '<div class="pie-chart"></div>',
    replace: true,
    scope: {
      votes: '='
    },
    restrict: 'E',
    controller: function($scope, $element, $timeout) {
      return $timeout(function() {
        var arcPath, countUniquePositions, draw, half, positionColors, radius, shapes, size;
        size = $element[0].offsetWidth;
        draw = SVG($element[0]).size('100%', '100%');
        half = size / 2.0;
        radius = half;
        arcPath = function(startAngle, endAngle) {
          var rad, x1, x2, y1, y2;
          rad = Math.PI / 180;
          x1 = half + radius * Math.cos(-startAngle * rad);
          x2 = half + radius * Math.cos(-endAngle * rad);
          y1 = half + radius * Math.sin(-startAngle * rad);
          y2 = half + radius * Math.sin(-endAngle * rad);
          return ["M", half, half, "L", x1, y1, "A", radius, radius, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"].join(' ');
        };
        positionColors = {
          yes: '#39A96F',
          abstain: '#FAA030',
          no: '#F15E72',
          block: '#CE261B'
        };
        shapes = [];
        countUniquePositions = function(votes) {
          return _.sum(votes, function(num) {
            return +(num > 0);
          });
        };
        return $scope.$watch('votes', function() {
          var position, sortedPositions, start, totalSegments, totalVotes, voteAngle;
          start = 90;
          _.each(shapes, function(arc) {
            return arc.remove();
          });
          totalVotes = _.sum($scope.votes);
          voteAngle = 360 / totalVotes;
          totalSegments = countUniquePositions($scope.votes);
          sortedPositions = _.sortBy(_.pairs($scope.votes), function(pair) {
            return -pair[1];
          });
          switch (totalSegments) {
            case 0:
              return shapes.push(draw.circle(size).attr({
                'stroke-width': 0,
                fill: '#aaa'
              }));
            case 1:
              position = sortedPositions[0][0];
              return shapes.push(draw.circle(size).attr({
                'stroke-width': 0,
                fill: positionColors[position]
              }));
            default:
              return _.each(sortedPositions, function(pair) {
                var angle, votes;
                position = pair[0];
                votes = pair[1];
                if (votes === 0) {
                  return;
                }
                angle = 360 / totalVotes * votes;
                shapes.push(draw.path(arcPath(start, start + angle)).attr({
                  'stroke-width': 0,
                  fill: positionColors[position]
                }));
                return start += angle;
              });
          }
        });
      });
    }
  };
});

angular.module('loomioApp').controller('PreviousProposalsPageController', function($scope, $rootScope, $routeParams, Records, AbilityService) {
  $rootScope.$broadcast('currentComponent', {
    page: 'previousProposalsPage'
  });
  Records.groups.findOrFetchById($routeParams.key).then((function(_this) {
    return function(group) {
      return _this.group = group;
    };
  })(this));
  Records.proposals.fetchClosedByGroup($routeParams.key);
});

angular.module('loomioApp').directive('proposalClosingTime', function() {
  return {
    scope: {
      proposal: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/proposal_closing_time/proposal_closing_time.html',
    replace: true
  };
});

angular.module('loomioApp').directive('closingAtField', function() {
  return {
    scope: {
      proposal: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/proposal_form/closing_at_field.html',
    replace: true,
    controller: function($scope, CurrentUser) {
      var j, results, updateClosingAt;
      $scope.hours = (function() {
        results = [];
        for (j = 1; j <= 24; j++){ results.push(j); }
        return results;
      }).apply(this);
      $scope.closingHour = $scope.proposal.closingAt.format('H');
      $scope.closingDate = $scope.proposal.closingAt.toDate();
      updateClosingAt = function() {
        return $scope.proposal.closingAt = moment($scope.closingDate).startOf('day').add($scope.closingHour, 'hours');
      };
      $scope.$watch('closingDate', updateClosingAt);
      $scope.$watch('closingHour', updateClosingAt);
      $scope.hours = _.times(24, function(i) {
        return i;
      });
      $scope.times = _.times(24, function(i) {
        if (i < 10) {
          i = "0" + i;
        }
        return moment("2015-01-01 " + i + ":00").format('h a');
      });
      $scope.dateToday = moment().format('YYYY-MM-DD');
      return $scope.timeZone = jstz.determine().name();
    }
  };
});

angular.module('loomioApp').factory('ProposalForm', function() {
  return {
    templateUrl: 'generated/components/proposal_form/proposal_form.html',
    controller: function($scope, $rootScope, proposal, FormService, KeyEventService, ScrollService, EmojiService) {
      var actionName;
      $scope.proposal = proposal.clone();
      actionName = $scope.proposal.isNew() ? 'created' : 'updated';
      $scope.submit = FormService.submit($scope, $scope.proposal, {
        flashSuccess: "proposal_form.messages." + actionName,
        allowDrafts: true,
        successCallback: function() {
          $rootScope.$broadcast('setSelectedProposal');
          return ScrollService.scrollTo('#current-proposal-card-heading');
        }
      });
      $scope.descriptionSelector = '.proposal-form__details-field';
      EmojiService.listen($scope, $scope.proposal, 'description', $scope.descriptionSelector);
      return KeyEventService.submitOnEnter($scope);
    }
  };
});

angular.module('loomioApp').controller('ProfilePageController', function($rootScope, Records, FormService, $location, AbilityService, ModalService, ChangePictureForm, ChangePasswordForm, DeactivateUserForm, $translate, CurrentUser, AppConfig) {
  this.user = CurrentUser;
  this.init = (function(_this) {
    return function() {
      return $translate.use(_this.user.locale);
    };
  })(this);
  this.init();
  this.availableLocales = function() {
    return AppConfig.locales;
  };
  this.submit = FormService.submit(this, this.user, {
    flashSuccess: 'profile_page.messages.updated',
    submitFn: Records.users.updateProfile,
    successCallback: this.init
  });
  this.changePicture = function() {
    return ModalService.open(ChangePictureForm);
  };
  this.changePassword = function() {
    return ModalService.open(ChangePasswordForm);
  };
  this.deactivateUser = function() {
    return ModalService.open(DeactivateUserForm);
  };
  this.canDeactivateUser = function() {
    return AbilityService.canDeactivateUser();
  };
});

angular.module('loomioApp').controller('ProposalRedirectController', function($router, $rootScope, $routeParams, $location, Records, LmoUrlService) {
  $rootScope.$broadcast('currentComponent', 'proposalRedirect');
  Records.proposals.findOrFetchById($routeParams.key).then((function(_this) {
    return function(proposal) {
      return Records.discussions.findOrFetchById(proposal.discussionId).then(function(discussion) {
        var params;
        params = {
          proposal: proposal.key
        };
        if ($location.search().position != null) {
          params.position = $location.search().position;
        }
        return $location.url(LmoUrlService.discussion(discussion, params));
      });
    };
  })(this));
});

angular.module('loomioApp').factory('RegisteredAppForm', function() {
  return {
    templateUrl: 'generated/components/registered_app_form/registered_app_form.html',
    controller: function($scope, $location, application, Records, FormService, LmoUrlService, KeyEventService) {
      var actionName;
      $scope.application = application.clone();
      actionName = $scope.application.isNew() ? 'created' : 'updated';
      $scope.submit = FormService.submit($scope, $scope.application, {
        flashSuccess: "registered_app_form.messages." + actionName,
        flashOptions: {
          name: function() {
            return $scope.application.name;
          }
        },
        successCallback: function(response) {
          if ($scope.application.isNew()) {
            return $location.path(LmoUrlService.oauthApplication(response.oauth_applications[0]));
          }
        }
      });
      $scope.upload = FormService.upload($scope, $scope.application, {
        flashSuccess: 'registered_app_form.messages.logo_changed',
        submitFn: $scope.application.uploadLogo,
        loadingMessage: 'common.action.uploading',
        skipClose: true,
        successCallback: function(response) {
          return $scope.application.logoUrl = response.data.oauth_applications[0].logo_url;
        }
      });
      $scope.clickFileUpload = function() {
        return document.querySelector('.registered-app-form__logo-input').click();
      };
      return KeyEventService.submitOnEnter($scope);
    }
  };
});

angular.module('loomioApp').controller('RegisteredAppPageController', function($scope, $rootScope, $routeParams, Records, FlashService, ModalService, RegisteredAppForm, RemoveAppForm) {
  this.init = (function(_this) {
    return function(application) {
      if (application && (_this.application == null)) {
        _this.application = application;
        $rootScope.$broadcast('currentComponent', {
          page: 'oauthApplicationPage'
        });
        return $rootScope.$broadcast('setTitle', _this.application.name);
      }
    };
  })(this);
  this.init(Records.oauthApplications.find(parseInt($routeParams.id)));
  Records.oauthApplications.findOrFetchById(parseInt($routeParams.id)).then(this.init, function(error) {
    return $rootScope.$broadcast('pageError', error);
  });
  this.copied = function() {
    return FlashService.success('common.copied');
  };
  this.openRemoveForm = function() {
    return ModalService.open(RemoveAppForm, {
      application: (function(_this) {
        return function() {
          return _this.application;
        };
      })(this)
    });
  };
  this.openEditForm = function() {
    return ModalService.open(RegisteredAppForm, {
      application: (function(_this) {
        return function() {
          return _this.application;
        };
      })(this)
    });
  };
});

angular.module('loomioApp').directive('proposalAccordian', function() {
  return {
    scope: {
      model: '=',
      selectedProposalId: '=?'
    },
    restrict: 'E',
    templateUrl: 'generated/components/proposal_accordian/proposal_accordian.html',
    replace: true,
    controller: function($scope, CurrentUser) {
      $scope.$on('collapseProposal', function(event) {
        return $scope.selectedProposalId = null;
      });
      return $scope.selectProposal = (function(_this) {
        return function(proposal) {
          return $scope.selectedProposalId = proposal.id;
        };
      })(this);
    }
  };
});

angular.module('loomioApp').controller('RegisteredAppsPageController', function($scope, $rootScope, Records, ModalService, RegisteredAppForm, RemoveAppForm) {
  $rootScope.$broadcast('currentComponent', {
    page: 'registeredAppsPage'
  });
  $rootScope.$broadcast('setTitle', 'OAuth Application Dashboard');
  this.loading = true;
  this.applications = function() {
    return Records.oauthApplications.collection.data;
  };
  Records.oauthApplications.fetchOwned().then((function(_this) {
    return function() {
      return _this.loading = false;
    };
  })(this));
  this.openApplicationForm = function(application) {
    return ModalService.open(RegisteredAppForm, {
      application: function() {
        return Records.oauthApplications.build();
      }
    });
  };
  this.openDestroyForm = function(application) {
    return ModalService.open(RemoveAppForm, {
      application: function() {
        return application;
      }
    });
  };
});

angular.module('loomioApp').factory('RemoveAppForm', function() {
  return {
    templateUrl: 'generated/components/remove_app_form/remove_app_form.html',
    controller: function($scope, $rootScope, application, FlashService) {
      $scope.application = application;
      return $scope.submit = function() {
        return $scope.application.destroy().then(function() {
          FlashService.success('remove_app_form.messages.success', {
            name: $scope.application.name
          });
          return $scope.$close();
        }, function() {
          $rootScope.$broadcast('pageError', 'cantDestroyApplication', $scope.application);
          return $scope.$close();
        });
      };
    }
  };
});

angular.module('loomioApp').factory('RevokeAppForm', function() {
  return {
    templateUrl: 'generated/components/revoke_app_form/revoke_app_form.html',
    controller: function($scope, $rootScope, application, FlashService) {
      $scope.application = application;
      return $scope.submit = function() {
        return $scope.application.revokeAccess().then(function() {
          FlashService.success('revoke_app_form.messages.success', {
            name: $scope.application.name
          });
          return $scope.$close();
        }, function() {
          $rootScope.$broadcast('pageError', 'cantRevokeApplication', $scope.application);
          return $scope.$close();
        });
      };
    }
  };
});

angular.module('loomioApp').factory('RemoveMembershipForm', function() {
  return {
    templateUrl: 'generated/components/remove_membership_form/remove_membership_form.html',
    controller: function($scope, $location, $rootScope, membership, FlashService, CurrentUser) {
      $scope.membership = membership;
      return $scope.submit = function() {
        return $scope.membership.destroy().then(function() {
          FlashService.success('memberships_page.messages.remove_member_success', {
            name: $scope.membership.userName()
          });
          $scope.$close();
          if ($scope.membership.user() === CurrentUser) {
            return $location.path("/dashboard");
          }
        }, function() {
          $rootScope.$broadcast('pageError', 'cantDestroyMembership', $scope.membership);
          return $scope.$close();
        });
      };
    }
  };
});

angular.module('loomioApp').directive('smartTime', function() {
  return {
    scope: {
      time: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/smart_time/smart_time.html',
    replace: true,
    controller: function($scope) {
      var format, now, sameDay, sameWeek, sameYear, time;
      time = moment($scope.time);
      now = moment();
      sameDay = function(time) {
        return time.year() === now.year() && time.month() === now.month() && time.date() === now.date();
      };
      sameWeek = function(time) {
        return time.year() === now.year() && time.month() === now.month() && time.week() === now.week();
      };
      sameYear = function(time) {
        return time.year() === now.year();
      };
      format = (function() {
        switch (false) {
          case !sameDay(time):
            return "h:mm a";
          case !sameWeek(time):
            return "ddd";
          case !sameYear(time):
            return "D MMM";
          default:
            return "MMM YYYY";
        }
      })();
      return $scope.value = time.format(format);
    }
  };
});

angular.module('loomioApp').directive('starToggle', function() {
  return {
    scope: {
      thread: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/star_toggle/star_toggle.html',
    replace: true,
    controller: function($scope, AbilityService) {
      $scope.isLoggedIn = AbilityService.isLoggedIn;
    }
  };
});

angular.module('loomioApp').factory('StartGroupForm', function() {
  return {
    templateUrl: 'generated/components/start_group_form/start_group_form.html',
    controller: function($scope, $rootScope, $location, group, Records, FormService, ModalService, GroupWelcomeModal, KeyEventService) {
      $scope.group = group;
      $scope.submit = FormService.submit($scope, $scope.group, $scope.group.isSubgroup() ? {
        allowDrafts: true,
        flashSuccess: 'start_group_form.messages.success_when_subgroup',
        successCallback: function(response) {
          return $location.path("/g/" + response.groups[0].key);
        }
      } : {
        allowDrafts: true,
        successCallback: function(response) {
          $location.path("/g/" + response.groups[0].key);
          return ModalService.open(GroupWelcomeModal);
        }
      });
      return KeyEventService.submitOnEnter($scope);
    }
  };
});

angular.module('loomioApp').directive('startMenu', function() {
  return {
    scope: {},
    restrict: 'E',
    templateUrl: 'generated/components/start_menu/start_menu.html',
    replace: true,
    controller: function($scope) {
      $scope.$on('modalOpened', function() {
        return $scope.startMenuOpen = false;
      });
      $scope.$on('currentComponent', function() {
        return $scope.currentGroup = null;
      });
      $scope.$on('viewingGroup', function(event, group) {
        return $scope.currentGroup = group;
      });
      $scope.$on('viewingThread', function(event, discussion) {
        return $scope.currentGroup = discussion.group();
      });
      return $scope.toggleStartMenu = function() {
        return $scope.startMenuOpen = !$scope.startMenuOpen;
      };
    }
  };
});

angular.module('loomioApp').directive('startMenuOption', function() {
  return {
    scope: {
      text: '@',
      icon: '@',
      action: '@',
      group: '=?',
      hotkey: '@?'
    },
    restrict: 'E',
    templateUrl: 'generated/components/start_menu/start_menu_option.html',
    replace: true,
    controller: function($scope, ModalService, InvitationForm, DiscussionForm, GroupForm, Records, AbilityService, KeyEventService, CurrentUser) {
      var availableGroups;
      $scope.openModal = function() {
        switch ($scope.action) {
          case 'invitePeople':
            return ModalService.open(InvitationForm, {
              group: function() {
                return $scope.invitePeopleGroup();
              }
            });
          case 'startGroup':
            return ModalService.open(GroupForm, {
              group: function() {
                return Records.groups.build();
              }
            });
          case 'startThread':
            return ModalService.open(DiscussionForm, {
              discussion: function() {
                return Records.discussions.build({
                  groupId: $scope.currentGroupId()
                });
              }
            });
        }
      };
      if ($scope.hotkey) {
        KeyEventService.registerKeyEvent($scope, $scope.hotkey, $scope.openModal);
      }
      availableGroups = function() {
        return _.filter(CurrentUser.groups(), function(group) {
          return AbilityService.canAddMembers(group);
        });
      };
      $scope.invitePeopleGroup = function() {
        if ($scope.group && AbilityService.canAddMembers($scope.group)) {
          return $scope.group;
        } else if (availableGroups().length === 1) {
          return $scope.group = _.first(availableGroups());
        } else {
          return Records.groups.build();
        }
      };
      return $scope.currentGroupId = function() {
        if ($scope.group != null) {
          return $scope.group.id;
        }
      };
    }
  };
});

angular.module('loomioApp').directive('startProposalButton', function() {
  return {
    scope: {
      discussion: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/start_proposal_button/start_proposal_button.html',
    replace: true,
    controller: function($scope, Records, ModalService, ProposalForm, AbilityService) {
      $scope.canStartProposal = function() {
        return AbilityService.canStartProposal($scope.discussion);
      };
      return $scope.startProposal = function() {
        return ModalService.open(ProposalForm, {
          proposal: function() {
            return Records.proposals.build({
              discussionId: $scope.discussion.id
            });
          }
        });
      };
    }
  };
});

angular.module('loomioApp').directive('threadLintel', function() {
  return {
    restrict: 'E',
    templateUrl: 'generated/components/thread_lintel/thread_lintel.html',
    replace: true,
    controller: function($scope, CurrentUser, ScrollService) {
      $scope.show = function() {
        return $scope.showLintel && $scope.discussion;
      };
      $scope.scrollToThread = function() {
        return ScrollService.scrollTo('h1');
      };
      $scope.scrollToProposal = function() {
        return ScrollService.scrollTo('section.current-proposal-card');
      };
      $scope.$on('currentComponent', function(event, options) {
        return $scope.currentComponent = options['page'];
      });
      $scope.$on('viewingThread', function(event, discussion) {
        return $scope.discussion = discussion;
      });
      $scope.$on('showThreadLintel', function(event, bool) {
        return $scope.showLintel = bool;
      });
      $scope.$on('proposalInView', function(event, bool) {
        return $scope.proposalInView = bool;
      });
      $scope.$on('proposalButtonInView', function(event, bool) {
        return $scope.proposalButtonInView = bool;
      });
      return $scope.$on('threadPosition', function(event, discussion, position) {
        $scope.position = position;
        $scope.discussion = discussion;
        return $scope.positionPercent = (position / discussion.lastSequenceId) * 100;
      });
    }
  };
});

angular.module('loomioApp').controller('ThreadPageController', function($scope, $routeParams, $location, $rootScope, $window, Records, MessageChannelService, ModalService, DiscussionForm, MoveThreadForm, DeleteThreadForm, ScrollService, AbilityService, CurrentUser, ChangeVolumeForm, PaginationService, LmoUrlService, TranslationService, RevisionHistoryModal, ProposalOutcomeForm) {
  var handleCommentHash;
  $rootScope.$broadcast('currentComponent', {
    page: 'threadPage'
  });
  this.requestedProposalKey = $routeParams.proposal || $location.search().proposal;
  this.requestedCommentId = parseInt($routeParams.comment || $location.search().comment);
  handleCommentHash = (function() {
    var match;
    if (match = $location.hash().match(/comment-(\d+)/)) {
      $location.search().comment = match[1];
      return $location.hash('');
    }
  })();
  this.performScroll = function() {
    ScrollService.scrollTo(this.elementToFocus(), 150);
    if (this.openVoteModal()) {
      $rootScope.$broadcast('triggerVoteForm', $location.search().position);
    }
    if (this.openOutcomeModal()) {
      return ModalService.open(ProposalOutcomeForm, {
        proposal: (function(_this) {
          return function() {
            return _this.proposal;
          };
        })(this)
      });
    }
  };
  this.openVoteModal = function() {
    return $location.search().position && this.discussion.hasActiveProposal() && this.discussion.activeProposal().key === $location.search().proposal && AbilityService.canVoteOn(this.discussion.activeProposal());
  };
  this.openOutcomeModal = function() {
    return ($routeParams.outcome != null) && AbilityService.canSetOutcomeFor(this.proposal);
  };
  this.elementToFocus = function() {
    if (this.proposal) {
      return "#proposal-" + this.proposal.key;
    } else if (this.comment) {
      return "#comment-" + this.comment.id;
    } else if (Records.events.findByDiscussionAndSequenceId(this.discussion, this.sequenceIdToFocus)) {
      return '.activity-card__last-read-activity';
    } else {
      return '.thread-context';
    }
  };
  this.threadElementsLoaded = function() {
    return this.eventsLoaded && this.proposalsLoaded;
  };
  this.init = (function(_this) {
    return function(discussion) {
      if (discussion && (_this.discussion == null)) {
        _this.discussion = discussion;
        _this.sequenceIdToFocus = parseInt($location.search().from || _this.discussion.lastReadSequenceId);
        _this.pageWindow = PaginationService.windowFor({
          current: _this.sequenceIdToFocus,
          min: _this.discussion.firstSequenceId,
          max: _this.discussion.lastSequenceId,
          pageType: 'activityItems'
        });
        $rootScope.$broadcast('viewingThread', _this.discussion);
        $rootScope.$broadcast('setTitle', _this.discussion.title);
        $rootScope.$broadcast('analyticsSetGroup', _this.discussion.group());
        return $rootScope.$broadcast('currentComponent', {
          page: 'threadPage',
          links: {
            canonical: LmoUrlService.discussion(_this.discussion, {}, {
              absolute: true
            }),
            rss: !_this.discussion["private"] ? LmoUrlService.discussion(_this.discussion) + '.xml' : void 0,
            prev: _this.pageWindow.prev != null ? LmoUrlService.discussion(_this.discussion, {
              from: _this.pageWindow.prev
            }) : void 0,
            next: _this.pageWindow.next != null ? LmoUrlService.discussion(_this.discussion, {
              from: _this.pageWindow.next
            }) : void 0
          }
        });
      }
    };
  })(this);
  this.init(Records.discussions.find($routeParams.key));
  Records.discussions.findOrFetchById($routeParams.key).then(this.init, function(error) {
    return $rootScope.$broadcast('pageError', error);
  });
  $scope.$on('threadPageEventsLoaded', (function(_this) {
    return function(e, event) {
      if (_this.eventRequiresReload(event)) {
        $window.location.reload();
      }
      _this.eventsLoaded = true;
      if (!isNaN(_this.requestedCommentId)) {
        _this.comment = Records.comments.find(_this.requestedCommentId);
      }
      if (_this.proposalsLoaded || !_this.discussion.anyClosedProposals()) {
        return _this.performScroll();
      }
    };
  })(this));
  $scope.$on('threadPageProposalsLoaded', (function(_this) {
    return function(event) {
      _this.proposalsLoaded = true;
      _this.proposal = Records.proposals.find(_this.requestedProposalKey);
      $rootScope.$broadcast('setSelectedProposal', _this.proposal);
      if (_this.eventsLoaded) {
        return _this.performScroll();
      }
    };
  })(this));
  this.eventRequiresReload = function(event) {
    return event && event.discussion() === this.discussion && !this.discussion.eventIsLoaded(event);
  };
  this.group = function() {
    return this.discussion.group();
  };
  this.showLintel = function(bool) {
    return $rootScope.$broadcast('showThreadLintel', bool);
  };
  this.editThread = function() {
    return ModalService.open(DiscussionForm, {
      discussion: (function(_this) {
        return function() {
          return _this.discussion;
        };
      })(this)
    });
  };
  this.moveThread = function() {
    return ModalService.open(MoveThreadForm, {
      discussion: (function(_this) {
        return function() {
          return _this.discussion;
        };
      })(this)
    });
  };
  this.deleteThread = function() {
    return ModalService.open(DeleteThreadForm, {
      discussion: (function(_this) {
        return function() {
          return _this.discussion;
        };
      })(this)
    });
  };
  this.showContextMenu = (function(_this) {
    return function() {
      return _this.canEditThread(_this.discussion);
    };
  })(this);
  this.canStartProposal = function() {
    return AbilityService.canStartProposal(this.discussion);
  };
  this.openChangeVolumeForm = function() {
    return ModalService.open(ChangeVolumeForm, {
      model: (function(_this) {
        return function() {
          return _this.discussion;
        };
      })(this)
    });
  };
  this.canChangeVolume = function() {
    return CurrentUser.isMemberOf(this.discussion.group());
  };
  this.canEditThread = (function(_this) {
    return function() {
      return AbilityService.canEditThread(_this.discussion);
    };
  })(this);
  this.canMoveThread = (function(_this) {
    return function() {
      return AbilityService.canMoveThread(_this.discussion);
    };
  })(this);
  this.canDeleteThread = (function(_this) {
    return function() {
      return AbilityService.canDeleteThread(_this.discussion);
    };
  })(this);
  this.proposalInView = function($inview) {
    return $rootScope.$broadcast('proposalInView', $inview);
  };
  this.proposalButtonInView = function($inview) {
    return $rootScope.$broadcast('proposalButtonInView', $inview);
  };
  this.showRevisionHistory = function() {
    return ModalService.open(RevisionHistoryModal, {
      model: (function(_this) {
        return function() {
          return _this.discussion;
        };
      })(this)
    });
  };
  TranslationService.listenForTranslations($scope, this);
});

angular.module('loomioApp').directive('threadPreview', function() {
  return {
    scope: {
      thread: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/thread_preview/thread_preview.html',
    replace: true,
    controller: function($scope, Records, CurrentUser, LmoUrlService, FlashService, ModalService, MuteExplanationModal) {
      $scope.lastVoteByCurrentUser = function(thread) {
        return thread.activeProposal().lastVoteByUser(CurrentUser);
      };
      $scope.changeVolume = function(volume) {
        if (!CurrentUser.hasMuted) {
          CurrentUser.update({
            hasMuted: true
          });
          return Records.users.updateProfile(CurrentUser).then(function() {
            return ModalService.open(MuteExplanationModal, {
              thread: function() {
                return $scope.thread;
              }
            });
          });
        } else {
          $scope.previousVolume = $scope.thread.volume();
          return $scope.thread.saveVolume(volume).then(function() {
            return FlashService.success("discussion.volume." + volume + "_message", {
              name: $scope.thread.title
            }, 'undo', $scope.undo);
          });
        }
      };
      $scope.undo = function() {
        return $scope.changeVolume($scope.previousVolume);
      };
    }
  };
});

angular.module('loomioApp').directive('threadPreviewCollection', function() {
  return {
    scope: {
      query: '=',
      limit: '=?'
    },
    restrict: 'E',
    templateUrl: 'generated/components/thread_preview_collection/thread_preview_collection.html',
    replace: true,
    controller: function($scope) {
      return $scope.importance = function(thread) {
        var multiplier;
        multiplier = thread.hasActiveProposal() && thread.starred ? -100000 : thread.hasActiveProposal() ? -10000 : thread.starred ? -1000 : -1;
        return multiplier * thread.lastActivityAt;
      };
    }
  };
});

angular.module('loomioApp').directive('timeago', function() {
  return {
    scope: {
      timestamp: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/timeago/timeago.html',
    replace: true
  };
});

angular.module('loomioApp').directive('translateButton', function() {
  return {
    scope: {
      model: '=',
      showdot: '=?'
    },
    restrict: 'E',
    templateUrl: 'generated/components/translate_button/translate_button.html',
    replace: true,
    controller: function($scope, Records, AbilityService, CurrentUser, LoadingService) {
      $scope.canTranslate = function() {
        return AbilityService.canTranslate($scope.model) && !$scope.translateExecuting && !$scope.translated;
      };
      $scope.translate = function() {
        return Records.translations.fetchTranslation($scope.model, CurrentUser.locale).then(function(data) {
          $scope.translated = true;
          return $scope.$emit('translationComplete', data.translations[0].fields);
        });
      };
      return LoadingService.applyLoadingFunction($scope, 'translate');
    }
  };
});

angular.module('loomioApp').directive('translation', function() {
  return {
    scope: {
      translation: '=',
      field: '@'
    },
    restrict: 'E',
    templateUrl: 'generated/components/translation/translation.html',
    replace: true,
    controller: function($scope) {
      return $scope.translated = $scope.translation[$scope.field];
    }
  };
});

angular.module('loomioApp').directive('userAvatar', function() {
  return {
    scope: {
      user: '=',
      coordinator: '=?',
      size: '@?'
    },
    restrict: 'E',
    templateUrl: 'generated/components/user_avatar/user_avatar.html',
    replace: true,
    controller: function($scope) {
      var sizes;
      sizes = ['small', 'medium', 'large', 'featured'];
      if (!_.contains(sizes, $scope.size)) {
        return $scope.size = 'small';
      }
    }
  };
});

angular.module('loomioApp').controller('UserPageController', function($rootScope, $routeParams, Records, LoadingService) {
  $rootScope.$broadcast('currentComponent', {
    page: 'userPage'
  });
  this.init = (function(_this) {
    return function() {
      if (_this.user) {
        return;
      }
      if (_this.user = (Records.users.find($routeParams.key) || Records.users.find({
        username: $routeParams.key
      }))[0]) {
        return _this.loadGroupsFor(_this.user.key);
      }
    };
  })(this);
  this.loadGroupsFor = function(userKey) {
    return Records.memberships.fetchByUser(userKey);
  };
  LoadingService.applyLoadingFunction(this, 'loadGroupsFor');
  this.init();
  Records.users.findOrFetchById($routeParams.key).then(this.init, function(error) {
    return $rootScope.$broadcast('pageError', error);
  });
});

angular.module('loomioApp').directive('validationErrors', function() {
  return {
    scope: {
      subject: '=',
      field: '@'
    },
    restrict: 'E',
    templateUrl: 'generated/components/validation_errors/validation_errors.html',
    replace: true
  };
});

angular.module('loomioApp').factory('MoveThreadForm', function() {
  return {
    templateUrl: 'generated/components/move_thread_form/move_thread_form.html',
    controller: function($scope, $location, discussion, CurrentUser, FormService, Records, $translate) {
      $scope.discussion = discussion.clone();
      $scope.availableGroups = function() {
        return _.filter(CurrentUser.groups(), function(group) {
          return group.id !== discussion.groupId;
        });
      };
      $scope.submit = FormService.submit($scope, $scope.discussion, {
        submitFn: $scope.discussion.move,
        flashSuccess: 'move_thread_form.messages.success',
        flashOptions: {
          name: function() {
            return $scope.discussion.group().name;
          }
        }
      });
      $scope.updateTarget = function() {
        return $scope.targetGroup = Records.groups.find($scope.discussion.groupId);
      };
      $scope.updateTarget();
      return $scope.moveThread = function() {
        if ($scope.discussion["private"] && $scope.targetGroup.privacyIsOpen()) {
          if (confirm($translate.instant('move_thread_form.confirm_change_to_private_thread', {
            groupName: $scope.targetGroup.name
          }))) {
            return $scope.submit();
          }
        } else {
          return $scope.submit();
        }
      };
    }
  };
});

angular.module('loomioApp').factory('MuteExplanationModal', function() {
  return {
    templateUrl: 'generated/components/mute_explanation_modal/mute_explanation_modal.html',
    controller: function($scope, thread, CurrentUser, Records, FlashService) {
      $scope.thread = thread;
      $scope.previousVolume = $scope.thread.volume();
      $scope.changeVolume = function(volume) {
        return $scope.thread.saveVolume(volume).then(function() {
          FlashService.success("discussion.volume." + volume + "_message", {
            name: $scope.thread.title
          }, 'undo', $scope.undo);
          return $scope.$close();
        });
      };
      return $scope.undo = function() {
        return $scope.changeVolume($scope.previousVolume);
      };
    }
  };
});

angular.module('loomioApp').directive('navbar', function() {
  return {
    scope: {},
    restrict: 'E',
    templateUrl: 'generated/components/navbar/navbar.html',
    replace: true,
    controller: function($scope, $rootScope, $window, Records, ThreadQueryService, AppConfig, AbilityService) {
      var parser;
      parser = document.createElement('a');
      parser.href = AppConfig.baseUrl;
      $scope.officialLoomio = AppConfig.isLoomioDotOrg;
      $scope.hostName = parser.hostname;
      $scope.isLoggedIn = function() {
        return AbilityService.isLoggedIn();
      };
      $scope.$on('currentComponent', function(el, component) {
        return $scope.selected = component.page;
      });
      $scope.unreadThreadCount = function() {
        return ThreadQueryService.filterQuery(['show_unread', 'only_threads_in_my_groups'], {
          queryType: 'inbox'
        }).length();
      };
      $scope.homePageClicked = function() {
        return $rootScope.$broadcast('homePageClicked');
      };
      return $scope.goToSignIn = function() {
        return $window.location = '/users/sign_in';
      };
    }
  };
});

angular.module('loomioApp').directive('navbarSearch', function() {
  return {
    scope: {},
    restrict: 'E',
    templateUrl: 'generated/components/navbar/navbar_search.html',
    replace: true,
    controller: function($scope, $element, $timeout, CurrentUser, Records, SearchResultModel, KeyEventService) {
      var highlightables;
      $scope.searchResults = [];
      $scope.query = '';
      $scope.focused = false;
      $scope.highlighted = null;
      $scope.closeSearchDropdown = function(e) {
        var target;
        if (e != null) {
          target = e.currentTarget;
          if (e.ctrlKey || e.metaKey) {
            target.target = '_blank';
          }
        }
        return $timeout(function() {
          if (target != null) {
            target.click();
          }
          $scope.focused = false;
          $scope.query = '';
          return $scope.updateHighlighted(null);
        });
      };
      $scope.handleSearchBlur = function() {
        if ($element[0].contains(document.activeElement)) {
          return;
        }
        return $scope.closeSearchDropdown();
      };
      $scope.showDropdown = function() {
        return $scope.focused && (_.any($scope.groups()) || $scope.query);
      };
      highlightables = function() {
        return document.querySelectorAll('.navbar-search-list-option');
      };
      $scope.highlightedSelection = function() {
        return highlightables()[$scope.highlighted];
      };
      $scope.updateHighlighted = function(index) {
        $scope.highlighted = index;
        _.map(highlightables(), function(element) {
          return element.classList.remove("lmo-active");
        });
        if ($scope.highlightedSelection() != null) {
          $scope.highlightedSelection().firstChild.focus();
          return $scope.highlightedSelection().classList.add("lmo-active");
        }
      };
      $scope.searchField = function() {
        return angular.element(document.querySelector('#primary-search-input'))[0];
      };
      $scope.shouldExecuteWithSearchField = function(active, event) {
        return active === $scope.searchField() || KeyEventService.defaultShouldExecute(active, event);
      };
      KeyEventService.registerKeyEvent($scope, 'pressedEsc', function() {
        $scope.searchField().blur();
        return $scope.query = '';
      }, $scope.shouldExecuteWithSearchField);
      KeyEventService.registerKeyEvent($scope, 'pressedSlash', function(active) {
        $scope.searchField().focus();
        return $scope.query = '';
      });
      KeyEventService.registerKeyEvent($scope, 'pressedEnter', function() {
        if ($scope.highlightedSelection()) {
          return $scope.closeSearchDropdown(document.activeElement);
        }
      }, $scope.shouldExecuteWithSearchField);
      KeyEventService.registerKeyEvent($scope, 'pressedUpArrow', function(active) {
        if (isNaN(parseInt($scope.highlighted)) || $scope.highlighted === 0) {
          return $scope.updateHighlighted(highlightables().length - 1);
        } else {
          return $scope.updateHighlighted($scope.highlighted - 1);
        }
      }, $scope.shouldExecuteWithSearchField);
      KeyEventService.registerKeyEvent($scope, 'pressedDownArrow', function(active) {
        if (isNaN(parseInt($scope.highlighted)) || $scope.highlighted === highlightables().length - 1) {
          return $scope.updateHighlighted(0);
        } else {
          return $scope.updateHighlighted($scope.highlighted + 1);
        }
      }, $scope.shouldExecuteWithSearchField);
      $scope.clearAndFocusInput = function() {
        $scope.closeSearchDropdown();
        return $scope.searchField().focus();
      };
      $scope.queryPresent = function() {
        return $scope.query.length > 0;
      };
      $scope.queryEmpty = function() {
        return $scope.query.length === 0;
      };
      $scope.noResultsFound = function() {
        return !$scope.searching && $scope.searchResults.length === 0;
      };
      $scope.groups = function() {
        if (!$scope.queryPresent()) {
          return CurrentUser.groups();
        }
        return _.filter(CurrentUser.groups(), function(group) {
          return _.all(_.words($scope.query), function(word) {
            return _.contains(group.fullName.toLowerCase(), word.toLowerCase());
          });
        });
      };
      return $scope.getSearchResults = function(query) {
        if (query != null) {
          $scope.updateHighlighted(null);
          $scope.currentSearchQuery = query;
          $scope.searching = true;
          return Records.searchResults.fetchByFragment($scope.query).then(function() {
            $scope.searchResults = Records.searchResults.find({
              query: query
            });
            _.map($scope.searchResults, function(result) {
              return result.remove();
            });
            if ($scope.currentSearchQuery === query) {
              return $scope.searching = false;
            }
          });
        }
      };
    }
  };
});

angular.module('loomioApp').directive('navbarUserOptions', function() {
  return {
    scope: {
      group: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/navbar/navbar_user_options.html',
    replace: true,
    controller: function($scope, $rootScope, CurrentUser, $window, RestfulClient, IntercomService, AppConfig, UserHelpService) {
      $scope.currentUser = CurrentUser;
      $scope.helpLink = function() {
        return UserHelpService.helpLink();
      };
      $scope.signOut = function() {
        $rootScope.$broadcast('logout');
        this.sessionClient = new RestfulClient('sessions');
        return this.sessionClient.destroy('').then(function() {
          return $window.location = '/';
        });
      };
      $scope.showContactUs = function() {
        return AppConfig.isLoomioDotOrg;
      };
      return $scope.contactUs = function() {
        return IntercomService.contactUs();
      };
    }
  };
});

angular.module('loomioApp').directive('searchResult', function() {
  return {
    scope: {
      result: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/navbar/search_result.html',
    replace: true,
    controller: function($scope, $rootScope, Records) {
      var escapeForRegex;
      escapeForRegex = function(str) {
        return str.replace(/\/|\?|\*|\.|\(|\)/g, '');
      };
      $scope.rawDiscussionBlurb = function() {
        return escapeForRegex($scope.result.blurb.replace(/\<\/?b\>/g, ''));
      };
      $scope.showBlurbLeader = function() {
        return !escapeForRegex($scope.result.description).match(RegExp("^" + ($scope.rawDiscussionBlurb())));
      };
      $scope.showBlurbTrailer = function() {
        return !escapeForRegex($scope.result.description).match(RegExp(($scope.rawDiscussionBlurb()) + "$"));
      };
    }
  };
});

angular.module('loomioApp').factory('CoverPhotoForm', function() {
  return {
    templateUrl: 'generated/components/group_page/cover_photo_form/cover_photo_form.html',
    controller: function($scope, $timeout, group, Records, FormService) {
      $scope.selectFile = function() {
        return $timeout(function() {
          return document.querySelector('.cover-photo-form__file-input').click();
        });
      };
      return $scope.upload = FormService.upload($scope, group, {
        uploadKind: 'cover_photo',
        submitFn: group.uploadPhoto,
        loadingMessage: 'common.action.uploading',
        flashSuccess: 'group_cover_modal.upload_success'
      });
    }
  };
});

angular.module('loomioApp').directive('discussionsCard', function() {
  return {
    scope: {
      group: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/group_page/discussions_card/discussions_card.html',
    replace: true,
    controller: function($scope, $location, Records, ModalService, DiscussionForm, ThreadQueryService, KeyEventService, LoadingService, AbilityService, CurrentUser) {
      $scope.loaded = parseInt($location.search().from || 0);
      $scope.perPage = 25;
      $scope.canLoadMoreDiscussions = true;
      $scope.discussions = [];
      $scope.updateDiscussions = function(data) {
        if (data == null) {
          data = {};
        }
        $scope.discussions = ThreadQueryService.groupQuery($scope.group, {
          filter: 'all',
          queryType: 'all'
        });
        if ((data.discussions || []).length < $scope.perPage) {
          return $scope.canLoadMoreDiscussions = false;
        }
      };
      $scope.loadMore = function() {
        var options;
        options = {
          from: $scope.loaded,
          per: $scope.perPage
        };
        $scope.loaded += $scope.perPage;
        return Records.discussions.fetchByGroup($scope.group.key, options).then($scope.updateDiscussions, function() {
          return $scope.canLoadMoreDiscussions = false;
        });
      };
      LoadingService.applyLoadingFunction($scope, 'loadMore');
      $scope.loadMore();
      $scope.openDiscussionForm = function() {
        return ModalService.open(DiscussionForm, {
          discussion: function() {
            return Records.discussions.build({
              groupId: $scope.group.id
            });
          }
        });
      };
      $scope.showThreadsPlaceholder = function() {
        return $scope.group.discussions().length < 4;
      };
      $scope.whyImEmpty = function() {
        if (!AbilityService.canViewGroup($scope.group)) {
          return 'discussions_are_private';
        } else if (!$scope.group.hasDiscussions) {
          return 'no_discussions_in_group';
        } else if ($scope.group.discussionPrivacyOptions === 'private_only') {
          return 'discussions_are_private';
        } else {
          return 'no_public_discussions';
        }
      };
      $scope.howToGainAccess = function() {
        if (!$scope.group.hasDiscussions) {
          return null;
        } else if ($scope.group.membershipGrantedUpon === 'request') {
          return 'join_group';
        } else if ($scope.group.membershipGrantedUpon === 'approval') {
          return 'request_membership';
        } else if ($scope.group.membersCanAddMembers) {
          return 'membership_is_invitation_only';
        } else {
          return 'membership_is_invitation_by_admin_only';
        }
      };
      return $scope.isMemberOfGroup = function() {
        return CurrentUser.membershipFor($scope.group) != null;
      };
    }
  };
});

angular.module('loomioApp').directive('giftCard', function() {
  return {
    scope: {
      group: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/group_page/gift_card/gift_card.html',
    replace: true,
    controller: function($scope, $window, AppConfig, CurrentUser, ChargifyService) {
      $scope.show = function() {
        return CurrentUser.isMemberOf($scope.group) && $scope.group.subscriptionKind === 'gift' && (AppConfig.chargify != null);
      };
      return $scope.makeDonation = function() {
        $window.open(AppConfig.chargify.donation_url + "?" + (ChargifyService.encodedParams($scope.group)), '_blank');
        return true;
      };
    }
  };
});

angular.module('loomioApp').directive('groupPreviousProposalsCard', function() {
  return {
    scope: {
      group: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/group_page/group_previous_proposals_card/group_previous_proposals_card.html',
    replace: true,
    controller: function($scope, CurrentUser, Records, AbilityService) {
      if (AbilityService.canViewPreviousProposals($scope.group)) {
        Records.proposals.fetchClosedByGroup($scope.group.key).then(function() {
          return Records.votes.fetchMyVotes($scope.group);
        });
      }
      $scope.showPreviousProposals = function() {
        return AbilityService.canViewPreviousProposals($scope.group) && $scope.group.hasPreviousProposals();
      };
      return $scope.lastVoteByCurrentUser = function(proposal) {
        return proposal.lastVoteByUser(CurrentUser);
      };
    }
  };
});

angular.module('loomioApp').directive('groupActionsDropdown', function() {
  return {
    scope: {
      group: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/group_page/group_actions_dropdown/group_actions_dropdown.html',
    replace: true,
    controllerAs: 'groupActions',
    controller: function($scope, $window, AppConfig, AbilityService, CurrentUser, ChangeVolumeForm, ModalService, GroupForm, LeaveGroupForm, ArchiveGroupForm, Records, ChoosePlanModal) {
      this.canAdministerGroup = function() {
        return AbilityService.canAdministerGroup($scope.group);
      };
      this.canEditGroup = (function(_this) {
        return function() {
          return AbilityService.canEditGroup($scope.group);
        };
      })(this);
      this.canManageGroupSubscription = function() {
        return AbilityService.canManageGroupSubscription($scope.group);
      };
      this.canAddSubgroup = function() {
        return AbilityService.canCreateSubgroups($scope.group);
      };
      this.canArchiveGroup = (function(_this) {
        return function() {
          return AbilityService.canArchiveGroup($scope.group);
        };
      })(this);
      this.canChangeVolume = function() {
        return AbilityService.canChangeGroupVolume($scope.group);
      };
      this.openChangeVolumeForm = function() {
        return ModalService.open(ChangeVolumeForm, {
          model: function() {
            return $scope.group.membershipFor(CurrentUser);
          }
        });
      };
      this.editGroup = function() {
        return ModalService.open(GroupForm, {
          group: function() {
            return $scope.group;
          }
        });
      };
      this.addSubgroup = function() {
        return ModalService.open(GroupForm, {
          group: function() {
            return Records.groups.build({
              parentId: $scope.group.id
            });
          }
        });
      };
      this.leaveGroup = function() {
        return ModalService.open(LeaveGroupForm, {
          group: function() {
            return $scope.group;
          }
        });
      };
      this.archiveGroup = function() {
        return ModalService.open(ArchiveGroupForm, {
          group: function() {
            return $scope.group;
          }
        });
      };
      this.manageSubscriptions = function() {
        $window.open("https://www.billingportal.com/s/" + AppConfig.chargify.appName + "/login/magic", '_blank');
        return true;
      };
      this.choosePlan = function() {
        return ModalService.open(ChoosePlanModal, {
          group: function() {
            return $scope.group;
          }
        });
      };
    }
  };
});

angular.module('loomioApp').directive('groupHelpCard', function() {
  return {
    scope: {
      group: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/group_page/group_help_card/group_help_card.html',
    replace: true,
    controller: function($scope, CurrentUser, AppConfig, UserHelpService) {
      $scope.showVideo = AppConfig.loadVideos;
      $scope.helpLink = function() {
        return UserHelpService.helpLink();
      };
      return $scope.showHelpCard = function() {
        return CurrentUser.isMemberOf($scope.group);
      };
    }
  };
});

angular.module('loomioApp').directive('groupPrivacyButton', function() {
  return {
    restrict: 'E',
    templateUrl: 'generated/components/group_page/group_privacy_button/group_privacy_button.html',
    replace: true,
    scope: {
      group: '='
    },
    controller: function($scope, PrivacyString) {
      $scope.iconClass = function() {
        switch ($scope.group.groupPrivacy) {
          case 'open':
            return 'fa-globe';
          case 'closed':
            return 'fa-lock';
          case 'secret':
            return 'fa-lock';
        }
      };
      return $scope.privacyDescription = function() {
        return PrivacyString.group($scope.group);
      };
    }
  };
});

angular.module('loomioApp').directive('joinGroupButton', function() {
  return {
    scope: {
      group: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/group_page/join_group_button/join_group_button.html',
    replace: true,
    controller: function($scope, $window, AbilityService, ModalService, CurrentUser, Records, FlashService, MembershipRequestForm) {
      Records.membershipRequests.fetchMyPendingByGroup($scope.group.key);
      $scope.isMember = function() {
        return CurrentUser.membershipFor($scope.group) != null;
      };
      $scope.canJoinGroup = function() {
        return AbilityService.canJoinGroup($scope.group);
      };
      $scope.canRequestMembership = function() {
        return AbilityService.canRequestMembership($scope.group);
      };
      $scope.joinGroup = function() {
        if (AbilityService.isLoggedIn()) {
          return Records.memberships.joinGroup($scope.group).then(function() {
            return FlashService.success('join_group_button.messages.joined_group', {
              group: $scope.group.fullName
            });
          });
        } else {
          return $window.location = '/users/sign_up?group_key=' + $scope.group.key;
        }
      };
      $scope.requestToJoinGroup = function() {
        return ModalService.open(MembershipRequestForm, {
          group: function() {
            return $scope.group;
          }
        });
      };
      return $scope.isLoggedIn = function() {
        return AbilityService.isLoggedIn();
      };
    }
  };
});

angular.module('loomioApp').factory('GroupWelcomeModal', function() {
  return {
    shownToGroup: {},
    templateUrl: 'generated/components/group_page/group_welcome_modal/group_welcome_modal.html',
    size: 'group-welcome-modal',
    controller: function($scope, AppConfig) {
      return $scope.showVideo = AppConfig.loadVideos;
    }
  };
});

angular.module('loomioApp').directive('groupTheme', function() {
  return {
    scope: {
      group: '=',
      homePage: '=',
      compact: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/group_page/group_theme/group_theme.html',
    replace: true,
    controller: function($scope, CurrentUser, AbilityService, ModalService, CoverPhotoForm, LogoPhotoForm) {
      $scope.logoStyle = function() {
        return {
          'background-image': "url(" + ($scope.group.logoUrl()) + ")"
        };
      };
      $scope.coverStyle = function() {
        return {
          'background-image': "url(" + ($scope.group.coverUrl()) + ")",
          'z-index': ($scope.compact ? -1 : void 0)
        };
      };
      $scope.isMember = function() {
        return CurrentUser.membershipFor($scope.group) != null;
      };
      $scope.canUploadPhotos = function() {
        return $scope.homePage && AbilityService.canAdministerGroup($scope.group);
      };
      $scope.openUploadCoverForm = function() {
        return ModalService.open(CoverPhotoForm, {
          group: (function(_this) {
            return function() {
              return $scope.group;
            };
          })(this)
        });
      };
      $scope.openUploadLogoForm = function() {
        return ModalService.open(LogoPhotoForm, {
          group: (function(_this) {
            return function() {
              return $scope.group;
            };
          })(this)
        });
      };
      $scope.themeHoverIn = function() {
        return $scope.themeHover = true;
      };
      $scope.themeHoverOut = function() {
        return $scope.themeHover = false;
      };
      $scope.logoHoverIn = function() {
        return $scope.logoHover = true;
      };
      return $scope.logoHoverOut = function() {
        return $scope.logoHover = false;
      };
    }
  };
});

angular.module('loomioApp').factory('LogoPhotoForm', function() {
  return {
    scope: {
      group: '='
    },
    templateUrl: 'generated/components/group_page/logo_photo_form/logo_photo_form.html',
    controller: function($scope, $timeout, group, Records, FormService) {
      $scope.selectFile = function() {
        return $timeout(function() {
          return document.querySelector('.logo-photo-form__file-input').click();
        });
      };
      return $scope.upload = FormService.upload($scope, group, {
        uploadKind: 'logo',
        submitFn: group.uploadPhoto,
        loadingMessage: 'common.action.uploading',
        flashSuccess: 'group_logo_modal.upload_success'
      });
    }
  };
});

angular.module('loomioApp').directive('membersCard', function() {
  return {
    scope: {
      group: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/group_page/members_card/members_card.html',
    replace: true,
    controller: function($scope, Records, AbilityService, ModalService, InvitationForm, CurrentUser) {
      Records.memberships.fetchByGroup($scope.group.key, {
        per: 10
      });
      $scope.canAddMembers = function() {
        return AbilityService.canAddMembers($scope.group);
      };
      $scope.isAdmin = function() {
        return AbilityService.canAdministerGroup($scope.group);
      };
      $scope.canViewMemberships = function() {
        return AbilityService.canViewMemberships($scope.group);
      };
      $scope.memberIsAdmin = function(member) {
        return $scope.group.membershipFor(member).admin;
      };
      $scope.showMembersPlaceholder = function() {
        return AbilityService.canAdministerGroup($scope.group) && $scope.group.memberships().length <= 1;
      };
      return $scope.invitePeople = function() {
        return ModalService.open(InvitationForm, {
          group: function() {
            return $scope.group;
          }
        });
      };
    }
  };
});

angular.module('loomioApp').factory('MembershipRequestForm', function() {
  return {
    templateUrl: 'generated/components/group_page/membership_request_form/membership_request_form.html',
    controller: function($scope, FormService, Records, group, AbilityService, CurrentUser) {
      $scope.membershipRequest = Records.membershipRequests.build({
        groupId: group.id,
        name: CurrentUser.name,
        email: CurrentUser.email
      });
      $scope.submit = FormService.submit($scope, $scope.membershipRequest, {
        flashSuccess: 'membership_request_form.messages.membership_requested',
        flashOptions: {
          group: group.fullName
        }
      });
      $scope.isLoggedIn = AbilityService.isLoggedIn;
    }
  };
});

angular.module('loomioApp').directive('subgroupsCard', function() {
  return {
    scope: {
      group: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/group_page/subgroups_card/subgroups_card.html',
    replace: true,
    controller: function($scope, Records, AbilityService, ModalService, GroupForm) {
      Records.groups.fetchByParent($scope.group);
      $scope.canCreateSubgroups = function() {
        return AbilityService.canCreateSubgroups($scope.group);
      };
      $scope.startSubgroup = function() {
        return ModalService.open(GroupForm, {
          group: function() {
            return Records.groups.build({
              parentId: $scope.group.id
            });
          }
        });
      };
      return $scope.showSubgroupsCard = function() {
        return $scope.group.subgroups().length;
      };
    }
  };
});

angular.module('loomioApp').directive('membershipRequestsCard', function() {
  return {
    scope: {
      group: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/group_page/membership_requests_card/membership_requests_card.html',
    replace: true,
    controller: function($scope, Records, AbilityService) {
      $scope.canManageMembershipRequests = function() {
        return AbilityService.canManageMembershipRequests($scope.group);
      };
      if ($scope.canManageMembershipRequests()) {
        return Records.membershipRequests.fetchPendingByGroup($scope.group.key);
      }
    }
  };
});

angular.module('loomioApp').factory('SubscriptionSuccessModal', function() {
  return {
    templateUrl: 'generated/components/group_page/subscription_success_modal/subscription_success_modal.html',
    size: 'subscription-success-modal',
    controller: function($scope, IntercomService) {
      return $scope.openIntercom = function() {
        IntercomService.contactUs();
        return $scope.$close();
      };
    }
  };
});

angular.module('loomioApp').directive('trialCard', function() {
  return {
    scope: {
      group: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/group_page/trial_card/trial_card.html',
    replace: true,
    controller: function($scope, ModalService, ChoosePlanModal, AbilityService, AppConfig, CurrentUser) {
      $scope.show = function() {
        return $scope.group.subscriptionKind === 'trial' && CurrentUser.isAdminOf($scope.group) && (AppConfig.chargify != null);
      };
      $scope.isExpired = function() {
        return moment().isAfter($scope.group.subscriptionExpiresAt);
      };
      return $scope.choosePlan = function() {
        return ModalService.open(ChoosePlanModal, {
          group: function() {
            return $scope.group;
          }
        });
      };
    }
  };
});

angular.module('loomioApp').factory('AddMembersModal', function() {
  return {
    templateUrl: 'generated/components/invitation_form/add_members_modal/add_members_modal.html',
    controller: function($scope, Records, LoadingService, group, AppConfig, FlashService, ModalService, InvitationForm) {
      $scope.isDisabled = false;
      $scope.group = group;
      $scope.loading = true;
      $scope.selectedIds = [];
      $scope.load = function() {
        return Records.memberships.fetchByGroup(group.parent().key, {
          per: 500
        });
      };
      $scope.members = function() {
        return _.filter(group.parent().members(), function(user) {
          return !user.isMemberOf(group);
        });
      };
      $scope.canAddMembers = function() {
        return $scope.members().length > 0;
      };
      LoadingService.applyLoadingFunction($scope, 'load');
      $scope.load();
      $scope.reopenInvitationsForm = function() {
        return ModalService.open(InvitationForm, {
          group: function() {
            return $scope.group;
          }
        });
      };
      return $scope.submit = function() {
        $scope.isDisabled = true;
        return Records.memberships.addUsersToSubgroup({
          groupId: $scope.group.id,
          userIds: $scope.selectedIds
        }).then(function(data) {
          if (data.memberships.length === 1) {
            FlashService.success('add_members_modal.user_added_to_subgroup', {
              name: data.users[0].name
            });
          } else {
            FlashService.success('add_members_modal.users_added_to_subgroup', {
              count: data.memberships.length
            });
          }
          return $scope.$close();
        })["finally"](function() {
          return $scope.isDisabled = false;
        });
      };
    }
  };
});

angular.module('loomioApp').directive('adminMembershipsPanel', function() {
  return {
    scope: {
      memberships: '=',
      group: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/memberships_page/admin_memberships_panel/admin_memberships_panel.html',
    replace: true,
    controller: 'AdminMembershipsPanelController'
  };
});

angular.module('loomioApp').controller('AdminMembershipsPanelController', function($scope, CurrentUser, AbilityService, ModalService, Records, FlashService, RemoveMembershipForm, InvitationForm, $filter) {
  $scope.canRemoveMembership = function(membership) {
    return AbilityService.canRemoveMembership(membership);
  };
  $scope.canToggleAdmin = function(membership) {
    return AbilityService.canAdministerGroup($scope.group) && (!membership.admin || $scope.canRemoveMembership(membership));
  };
  $scope.toggleAdmin = function(membership) {
    var method;
    method = membership.admin ? 'makeAdmin' : 'removeAdmin';
    if (!membership.admin && membership.user() === CurrentUser && !confirm($filter('translate')('memberships_page.remove_admin_from_self.question'))) {
      membership.admin = true;
      return;
    }
    return Records.memberships[method](membership).then(function() {
      return FlashService.success("memberships_page.messages." + (_.snakeCase(method)) + "_success", {
        name: membership.userName()
      });
    });
  };
  $scope.openRemoveForm = function(membership) {
    return ModalService.open(RemoveMembershipForm, {
      membership: function() {
        return membership;
      }
    });
  };
  $scope.canAddMembers = function() {
    return AbilityService.canAddMembers($scope.group);
  };
  return $scope.invitePeople = function() {
    return ModalService.open(InvitationForm, {
      group: (function(_this) {
        return function() {
          return $scope.group;
        };
      })(this)
    });
  };
});

angular.module('loomioApp').directive('pendingInvitationsCard', function() {
  return {
    scope: {
      group: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/memberships_page/pending_invitations_card/pending_invitations_card.html',
    replace: true,
    controller: function($scope, CurrentUser, Records, ModalService, CancelInvitationForm, AppConfig) {
      $scope.canSeeInvitations = function() {
        return CurrentUser.isAdminOf($scope.group);
      };
      if ($scope.canSeeInvitations()) {
        Records.invitations.fetchPendingByGroup($scope.group.key, {
          per: 1000
        });
      }
      $scope.baseUrl = AppConfig.baseUrl;
      $scope.openCancelForm = function(invitation) {
        return ModalService.open(CancelInvitationForm, {
          invitation: function() {
            return invitation;
          }
        });
      };
      return $scope.invitationCreatedAt = function(invitation) {
        return moment(invitation.createdAt).format('DD MMM YY');
      };
    }
  };
});

angular.module('loomioApp').directive('membershipsPanel', function() {
  return {
    scope: {
      memberships: '=',
      group: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/memberships_page/memberships_panel/memberships_panel.html',
    replace: true,
    controller: 'AdminMembershipsPanelController'
  };
});

angular.module('loomioApp').factory('CancelInvitationForm', function() {
  return {
    templateUrl: 'generated/components/memberships_page/cancel_invitation_form/cancel_invitation_form.html',
    controller: function($scope, invitation, FlashService, Records, FormService) {
      $scope.invitation = invitation;
      return $scope.submit = FormService.submit($scope, $scope.invitation, {
        submitFn: $scope.invitation.destroy,
        flashSuccess: 'cancel_invitation_form.messages.success'
      });
    }
  };
});

angular.module('loomioApp').directive('attachmentForm', function() {
  return {
    scope: {
      comment: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/thread_page/comment_form/attachment_form.html',
    replace: true,
    controller: function($scope, $rootScope, $timeout, Records) {
      $scope.upload = function(files) {
        var file, i, len, results;
        results = [];
        for (i = 0, len = files.length; i < len; i++) {
          file = files[i];
          $rootScope.$broadcast('disableCommentForm');
          $scope.currentUpload = Records.attachments.upload(file, $scope.progress);
          results.push($scope.currentUpload.then($scope.success)["finally"]($scope.reset));
        }
        return results;
      };
      $scope.selectFile = function() {
        return $timeout(function() {
          return document.querySelector('.attachment-form__file-input').click();
        });
      };
      $scope.progress = function(progress) {
        return $scope.percentComplete = Math.floor(100 * progress.loaded / progress.total);
      };
      $scope.abort = function() {
        if ($scope.currentUpload) {
          return $scope.currentUpload.abort();
        }
      };
      $scope.success = function(response) {
        var data;
        data = response.data || response;
        return _.each(data.attachments, function(attachment) {
          return $scope.comment.newAttachmentIds.push(attachment.id);
        });
      };
      $scope.reset = function() {
        $scope.files = $scope.currentUpload = null;
        $scope.percentComplete = 0;
        return $rootScope.$broadcast('enableCommentForm');
      };
      return $scope.reset();
    }
  };
});

angular.module('loomioApp').directive('commentForm', function() {
  return {
    scope: {
      discussion: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/thread_page/comment_form/comment_form.html',
    replace: true,
    controller: function($scope, $rootScope, FormService, Records, CurrentUser, KeyEventService, AbilityService, ScrollService, EmojiService) {
      var successMessage, successMessageName;
      $scope.$on('disableCommentForm', function() {
        return $scope.submitIsDisabled = true;
      });
      $scope.$on('enableCommentForm', function() {
        return $scope.submitIsDisabled = false;
      });
      $scope.showCommentForm = function() {
        return AbilityService.canAddComment($scope.discussion);
      };
      $scope.threadIsPublic = function() {
        return $scope.discussion["private"] === false;
      };
      $scope.threadIsPrivate = function() {
        return $scope.discussion["private"] === true;
      };
      successMessage = function() {
        if ($scope.comment.isReply()) {
          return 'comment_form.messages.replied';
        } else {
          return 'comment_form.messages.created';
        }
      };
      successMessageName = function() {
        if ($scope.comment.isReply()) {
          return $scope.comment.parent().authorName();
        }
      };
      $scope.init = function() {
        $scope.comment = Records.comments.build({
          discussionId: $scope.discussion.id
        });
        $scope.submit = FormService.submit($scope, $scope.comment, {
          allowDrafts: true,
          submitFn: $scope.comment.save,
          flashSuccess: successMessage,
          flashOptions: {
            name: successMessageName
          },
          successCallback: $scope.init
        });
        return KeyEventService.submitOnEnter($scope);
      };
      $scope.init();
      $scope.$on('replyToCommentClicked', function(event, parentComment) {
        $scope.comment.parentId = parentComment.id;
        return ScrollService.scrollTo('.comment-form__comment-field');
      });
      $scope.$on('attachmentRemoved', function(event, attachmentId) {
        var ids;
        ids = $scope.comment.newAttachmentIds;
        return ids.splice(ids.indexOf(attachmentId), 1);
      });
      $scope.bodySelector = '.comment-form__comment-field';
      EmojiService.listen($scope, $scope.comment, 'body', $scope.bodySelector);
      $scope.updateMentionables = function(fragment) {
        var allMembers, regex;
        regex = new RegExp("(^" + fragment + "| +" + fragment + ")", 'i');
        allMembers = _.filter($scope.discussion.group().members(), function(member) {
          if (member.id === CurrentUser.id) {
            return false;
          }
          return regex.test(member.name) || regex.test(member.username);
        });
        return $scope.mentionables = allMembers.slice(0, 5);
      };
      return $scope.fetchByNameFragment = function(fragment) {
        $scope.updateMentionables(fragment);
        return Records.memberships.fetchByNameFragment(fragment, $scope.discussion.group().key).then(function() {
          return $scope.updateMentionables(fragment);
        });
      };
    }
  };
});

angular.module('loomioApp').factory('DeleteCommentForm', function() {
  return {
    templateUrl: 'generated/components/thread_page/comment_form/delete_comment_form.html',
    controller: function($scope, $rootScope, Records, comment) {
      $scope.comment = comment;
      return $scope.submit = function() {
        return $scope.comment.destroy().then(function() {
          $scope.$close();
          return Records.events.find({
            commentId: $scope.comment.id
          })[0]["delete"]();
        }, function() {
          return $rootScope.$broadcast('pageError', 'cantDeleteComment');
        });
      };
    }
  };
});

angular.module('loomioApp').factory('EditCommentForm', function() {
  return {
    templateUrl: 'generated/components/thread_page/comment_form/edit_comment_form.html',
    controller: function($scope, comment, FormService, EmojiService) {
      $scope.comment = comment.clone();
      $scope.submit = FormService.submit($scope, $scope.comment, {
        flashSuccess: 'comment_form.messages.updated'
      });
      $scope.bodySelector = '.edit-comment-form__comment-field';
      return EmojiService.listen($scope, $scope.comment, 'body', $scope.bodySelector);
    }
  };
});

angular.module('loomioApp').directive('currentProposalCard', function() {
  return {
    scope: {
      proposal: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/thread_page/current_proposal_card/current_proposal_card.html',
    replace: true
  };
});

angular.module('loomioApp').directive('activityCard', function() {
  return {
    scope: {
      discussion: '=',
      activeCommentId: '=?'
    },
    restrict: 'E',
    templateUrl: 'generated/components/thread_page/activity_card/activity_card.html',
    replace: true,
    controller: function($scope, $location, $rootScope, Records, AppConfig, AbilityService, PaginationService, LoadingService) {
      var addSequenceId, removeSequenceId, updateLastSequenceId, visibleSequenceIds;
      $scope.firstLoadedSequenceId = 0;
      $scope.lastLoadedSequenceId = 0;
      $scope.lastReadSequenceId = $scope.discussion.lastReadSequenceId;
      $scope.hasNewActivity = $scope.discussion.isUnread();
      $scope.pagination = function(current) {
        return PaginationService.windowFor({
          current: current,
          min: $scope.discussion.firstSequenceId,
          max: $scope.discussion.lastSequenceId,
          pageType: 'activityItems'
        });
      };
      visibleSequenceIds = [];
      $scope.init = function() {
        $scope.discussion.markAsRead(0);
        return $scope.loadEventsForwards({
          commentId: $scope.activeCommentId,
          sequenceId: $scope.initialLoadSequenceId()
        }).then(function() {
          return $rootScope.$broadcast('threadPageEventsLoaded');
        });
      };
      $scope.initialLoadSequenceId = function() {
        if ($location.search().from) {
          return $location.search().from;
        }
        if (!AbilityService.isLoggedIn()) {
          return 0;
        }
        if ($scope.discussion.isUnread()) {
          return $scope.discussion.lastReadSequenceId - 5;
        }
        return $scope.pagination($scope.discussion.lastSequenceId).prev;
      };
      $scope.beforeCount = function() {
        return $scope.firstLoadedSequenceId - $scope.discussion.firstSequenceId;
      };
      updateLastSequenceId = function() {
        visibleSequenceIds = _.uniq(visibleSequenceIds);
        return $rootScope.$broadcast('threadPosition', $scope.discussion, _.max(visibleSequenceIds));
      };
      addSequenceId = function(id) {
        visibleSequenceIds.push(id);
        return updateLastSequenceId();
      };
      removeSequenceId = function(id) {
        visibleSequenceIds = _.without(visibleSequenceIds, id);
        return updateLastSequenceId();
      };
      $scope.threadItemHidden = function(item) {
        return removeSequenceId(item.sequenceId);
      };
      $scope.threadItemVisible = function(item) {
        addSequenceId(item.sequenceId);
        $scope.discussion.markAsRead(item.sequenceId);
        if ($scope.loadMoreAfterReading(item)) {
          return $scope.loadEventsForwards({
            sequenceId: $scope.lastLoadedSequenceId
          });
        }
      };
      $scope.loadEvents = function(arg) {
        var commentId, from, per;
        from = arg.from, per = arg.per, commentId = arg.commentId;
        if (from == null) {
          from = 0;
        }
        per = per || $scope.pagination().pageSize;
        return Records.events.fetchByDiscussion($scope.discussion.key, {
          from: from,
          per: per,
          comment_id: commentId
        }).then(function() {
          $scope.firstLoadedSequenceId = $scope.discussion.minLoadedSequenceId();
          return $scope.lastLoadedSequenceId = $scope.discussion.maxLoadedSequenceId();
        });
      };
      $scope.loadEventsForwards = function(arg) {
        var commentId, sequenceId;
        commentId = arg.commentId, sequenceId = arg.sequenceId;
        return $scope.loadEvents({
          commentId: commentId,
          from: sequenceId
        });
      };
      LoadingService.applyLoadingFunction($scope, 'loadEventsForwards');
      $scope.loadEventsBackwards = function() {
        return $scope.loadEvents({
          from: $scope.pagination($scope.firstLoadedSequenceId).prev
        });
      };
      LoadingService.applyLoadingFunction($scope, 'loadEventsBackwards');
      $scope.canLoadBackwards = function() {
        return $scope.firstLoadedSequenceId > $scope.discussion.firstSequenceId && !($scope.loadEventsForwardsExecuting || $scope.loadEventsBackwardsExecuting);
      };
      $scope.loadMoreAfterReading = function(item) {
        return item.sequenceId === $scope.lastLoadedSequenceId && item.sequenceId < $scope.discussion.lastSequenceId;
      };
      $scope.safeEvent = function(kind) {
        return _.contains(AppConfig.safeThreadItemKinds, kind);
      };
      $scope.events = function() {
        return _.filter($scope.discussion.events(), function(event) {
          return $scope.safeEvent(event.kind);
        });
      };
      $scope.noEvents = function() {
        return !$scope.loadEventsForwardsExecuting && !_.any($scope.events());
      };
      $scope.init();
    }
  };
});

angular.module('loomioApp').controller('DiscussionEditedItemController', function($scope) {
  var discussion, version;
  discussion = $scope.event.discussion();
  version = $scope.event.version();
  $scope.title = version.attributeEdited('title') ? version.changes.title[1] : '';
  $scope.onlyPrivacyEdited = function() {
    return version.attributeEdited('private') && !version.attributeEdited('title') && !version.attributeEdited('description');
  };
  $scope.privacyKey = function() {
    if (!$scope.onlyPrivacyEdited()) {
      return;
    }
    if (version.changes["private"][1]) {
      return 'discussion_edited_item.public_to_private';
    } else {
      return 'discussion_edited_item.private_to_public';
    }
  };
  $scope.actorName = $scope.event.actorName();
  return $scope.translationKey = version.editedAttributeNames().join('_');
});

angular.module('loomioApp').controller('DiscussionMovedItemController', function($scope) {
  return $scope.groupName = $scope.event.group().name;
});

angular.module('loomioApp').controller('MotionClosedItemController', function($scope) {
  $scope.actorName = event.actorName();
  return $scope.title = $scope.event.proposal().name;
});

angular.module('loomioApp').controller('MotionClosedItemController', function($scope) {
  return $scope.proposal = $scope.event.proposal();
});

angular.module('loomioApp').controller('MotionEditedItemController', function($scope) {
  var proposal, version;
  version = $scope.event.version();
  proposal = version.proposal();
  $scope.closingAt = version.attributeEdited('closing_at') ? moment(version.changes.closing_at[1]).format("ha dddd, Do MMMM YYYY") : null;
  $scope.title = version.attributeEdited('name') ? version.changes.name[1] : proposal.name;
  return $scope.translationKey = version.editedAttributeNames().join('_');
});

angular.module('loomioApp').controller('MotionOutcomeCreatedItemController', function($scope) {
  return $scope.proposal = $scope.event.proposal();
});

angular.module('loomioApp').controller('MotionOutcomeUpdatedItemController', function($scope) {
  return $scope.proposal = $scope.event.proposal();
});

angular.module('loomioApp').controller('NewCommentItemController', function($scope, $rootScope, $translate, Records, CurrentUser, ModalService, EditCommentForm, DeleteCommentForm, AbilityService, TranslationService, RevisionHistoryModal) {
  var renderLikedBySentence, updateLikedBySentence;
  renderLikedBySentence = function() {
    var joinedNames, name, otherIds, otherNames, otherUsers;
    otherIds = _.without($scope.comment.likerIds, CurrentUser.id);
    otherUsers = _.filter($scope.comment.likers(), function(user) {
      return _.contains(otherIds, user.id);
    });
    otherNames = _.map(otherUsers, function(user) {
      return user.name;
    });
    if ($scope.currentUserLikesIt()) {
      switch (otherNames.length) {
        case 0:
          return $translate('discussion.you_like_this').then(updateLikedBySentence);
        case 1:
          return $translate('discussion.liked_by_you_and_someone', {
            name: otherNames[0]
          }).then(updateLikedBySentence);
        default:
          joinedNames = otherNames.slice(0, -1).join(', ');
          name = otherNames.slice(-1)[0];
          return $translate('discussion.liked_by_you_and_others', {
            joinedNames: joinedNames,
            name: name
          }).then(updateLikedBySentence);
      }
    } else {
      switch (otherNames.length) {
        case 0:
          return '';
        case 1:
          return $translate('discussion.liked_by_someone', {
            name: otherNames[0]
          }).then(updateLikedBySentence);
        case 2:
          return $translate('discussion.liked_by_two_others', {
            name_1: otherNames[0],
            name_2: otherNames[1]
          }).then(updateLikedBySentence);
        default:
          joinedNames = otherNames.slice(0, -1).join(', ');
          name = otherNames.slice(-1)[0];
          return $translate('discussion.liked_by_many_others', {
            joinedNames: joinedNames,
            name: name
          }).then(updateLikedBySentence);
      }
    }
  };
  $scope.comment = $scope.event.comment();
  $scope.editComment = function() {
    return ModalService.open(EditCommentForm, {
      comment: function() {
        return $scope.comment;
      }
    });
  };
  $scope.deleteComment = function() {
    return ModalService.open(DeleteCommentForm, {
      comment: function() {
        return $scope.comment;
      }
    });
  };
  $scope.showContextMenu = function() {
    return $scope.canEditComment($scope.comment) || $scope.canDeleteComment($scope.comment);
  };
  $scope.canEditComment = function() {
    return AbilityService.canEditComment($scope.comment);
  };
  $scope.canDeleteComment = function() {
    return AbilityService.canDeleteComment($scope.comment);
  };
  $scope.showCommentActions = function() {
    return AbilityService.canRespondToComment($scope.comment);
  };
  $scope.like = function() {
    $scope.addLiker();
    return Records.comments.like(CurrentUser, $scope.comment).then((function() {}), $scope.removeLiker);
  };
  $scope.unlike = function() {
    $scope.removeLiker();
    return Records.comments.unlike(CurrentUser, $scope.comment).then((function() {}), $scope.addLiker);
  };
  $scope.currentUserLikesIt = function() {
    return _.contains($scope.comment.likerIds, CurrentUser.id);
  };
  $scope.anybodyLikesIt = function() {
    return $scope.comment.likerIds.length > 0;
  };
  $scope.likedBySentence = '';
  updateLikedBySentence = function(sentence) {
    return $scope.likedBySentence = sentence;
  };
  $scope.addLiker = function() {
    $scope.comment.addLiker(CurrentUser);
    return renderLikedBySentence();
  };
  $scope.removeLiker = function() {
    $scope.comment.removeLiker(CurrentUser);
    return renderLikedBySentence();
  };
  $scope.$watch('comment.likerIds', function() {
    return renderLikedBySentence();
  });
  $scope.reply = function() {
    return $rootScope.$broadcast('replyToCommentClicked', $scope.comment);
  };
  $scope.showRevisionHistory = function() {
    return ModalService.open(RevisionHistoryModal, {
      model: (function(_this) {
        return function() {
          return $scope.comment;
        };
      })(this)
    });
  };
  return TranslationService.listenForTranslations($scope);
});

angular.module('loomioApp').controller('NewVoteItemController', function($scope, TranslationService) {
  var vote;
  vote = $scope.event.vote();
  $scope.vote = vote;
  return TranslationService.listenForTranslations($scope);
});

angular.module('loomioApp').factory('CloseProposalForm', function() {
  return {
    templateUrl: 'generated/components/thread_page/close_proposal_form/close_proposal_form.html',
    controller: function($scope, $rootScope, FormService, proposal) {
      $scope.proposal = proposal;
      return $scope.submit = FormService.submit($scope, $scope.proposal, {
        submitFn: $scope.proposal.close,
        flashSuccess: 'close_proposal_form.messages.success',
        successCallback: function() {
          return $rootScope.$broadcast('setSelectedProposal');
        }
      });
    }
  };
});

angular.module('loomioApp').factory('ExtendProposalForm', function() {
  return {
    templateUrl: 'generated/components/thread_page/extend_proposal_form/extend_proposal_form.html',
    controller: function($scope, proposal, FlashService) {
      $scope.proposal = proposal.clone();
      $scope.submit = function() {
        return $scope.proposal.save().then(function() {
          $scope.$close();
          return FlashService.success('extend_proposal_form.success');
        });
      };
      return $scope.cancel = function($event) {
        return $scope.$close();
      };
    }
  };
});

angular.module('loomioApp').directive('previousProposalsCard', function() {
  return {
    scope: {
      discussion: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/thread_page/previous_proposals_card/previous_proposals_card.html',
    replace: true,
    controller: function($scope, $rootScope, Records) {
      var lastRecentlyClosedProposal;
      Records.votes.fetchMyVotes($scope.discussion);
      Records.proposals.fetchByDiscussion($scope.discussion).then(function() {
        return $rootScope.$broadcast('threadPageProposalsLoaded');
      });
      lastRecentlyClosedProposal = function() {
        var proposal;
        if (!($scope.anyProposals() && !$scope.discussion.hasActiveProposal())) {
          return;
        }
        proposal = $scope.discussion.closedProposals()[0];
        if (moment().add(-1, 'month') < proposal.closedAt) {
          return proposal;
        }
      };
      $scope.$on('setSelectedProposal', function(event, proposal) {
        return $scope.selectedProposalId = (proposal || lastRecentlyClosedProposal() || {}).id;
      });
      $scope.anyProposals = function() {
        return $scope.discussion.closedProposals().length > 0;
      };
    }
  };
});

angular.module('loomioApp').directive('proposalCollapsed', function() {
  return {
    scope: {
      proposal: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/thread_page/proposal_collapsed/proposal_collapsed.html',
    replace: true,
    controller: function($scope, CurrentUser) {
      return $scope.lastVoteByCurrentUser = function(proposal) {
        return proposal.lastVoteByUser(CurrentUser);
      };
    }
  };
});

angular.module('loomioApp').directive('positionButtonsPanel', function() {
  return {
    scope: {
      proposal: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/thread_page/position_buttons_panel/position_buttons_panel.html',
    replace: true,
    controller: function($scope, ModalService, VoteForm, CurrentUser, Records, AbilityService) {
      $scope.showPositionButtons = function() {
        return AbilityService.canVoteOn($scope.proposal) && $scope.undecided();
      };
      $scope.undecided = function() {
        return !($scope.proposal.lastVoteByUser(CurrentUser) != null);
      };
      $scope.$on('triggerVoteForm', function(event, position) {
        var myVote;
        myVote = $scope.proposal.lastVoteByUser(CurrentUser) || {};
        return $scope.select(position, myVote.statement);
      });
      return $scope.select = function(position) {
        return ModalService.open(VoteForm, {
          vote: function() {
            return Records.votes.build({
              proposalId: $scope.proposal.id,
              position: position
            });
          }
        });
      };
    }
  };
});

angular.module('loomioApp').directive('proposalExpanded', function() {
  return {
    scope: {
      proposal: '=',
      canCollapse: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/thread_page/proposal_expanded/proposal_expanded.html',
    replace: true,
    controller: function($scope, Records, CurrentUser, AbilityService, TranslationService) {
      Records.votes.fetchByProposal($scope.proposal);
      $scope.collapse = function() {
        return $scope.$emit('collapseProposal');
      };
      $scope.showActionsDropdown = function() {
        return AbilityService.canCloseOrExtendProposal($scope.proposal);
      };
      $scope.onlyVoterIsYou = function() {
        var uniqueVotes;
        uniqueVotes = $scope.proposal.uniqueVotes();
        return (uniqueVotes.length === 1) && (uniqueVotes[0].authorId === CurrentUser.id);
      };
      $scope.currentUserHasVoted = function() {
        return $scope.proposal.userHasVoted(CurrentUser);
      };
      $scope.currentUserVote = function() {
        return $scope.proposal.lastVoteByUser(CurrentUser);
      };
      $scope.showOutcomePanel = function() {
        return $scope.proposal.hasOutcome() || AbilityService.canCreateOutcomeFor($scope.proposal);
      };
      return TranslationService.listenForTranslations($scope);
    }
  };
});

angular.module('loomioApp').factory('ProposalOutcomeForm', function() {
  return {
    templateUrl: 'generated/components/thread_page/proposal_outcome_form/proposal_outcome_form.html',
    controller: function($scope, proposal, FormService, EmojiService) {
      $scope.proposal = proposal.clone();
      $scope.hasOutcome = proposal.hasOutcome();
      return $scope.submit = FormService.submit($scope, $scope.proposal, !$scope.hasOutcome ? {
        submitFn: $scope.proposal.createOutcome,
        flashSuccess: 'proposal_outcome_form.messages.created'
      } : {
        submitFn: $scope.proposal.updateOutcome,
        flashSuccess: 'proposal_outcome_form.messages.updated'
      }, $scope.outcomeSelector = '.proposal-form__outcome-field', EmojiService.listen($scope, $scope.proposal, 'outcome', $scope.outcomeSelector));
    }
  };
});

angular.module('loomioApp').directive('proposalPositionsPanel', function() {
  return {
    scope: {
      proposal: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/thread_page/proposal_positions_panel/proposal_positions_panel.html',
    replace: true,
    controller: function($scope, Records, CurrentUser, ModalService, VoteForm, AbilityService) {
      var sortValueForVote;
      $scope.undecidedPanelOpen = false;
      $scope.changeVote = function() {
        return ModalService.open(VoteForm, {
          vote: function() {
            return $scope.proposal.lastVoteByUser(CurrentUser).clone();
          }
        });
      };
      sortValueForVote = function(vote) {
        var positionValues;
        positionValues = {
          yes: 1,
          abstain: 2,
          no: 3,
          block: 4
        };
        if ($scope.voteIsMine(vote)) {
          return 0;
        } else {
          return positionValues[vote.position];
        }
      };
      $scope.curatedVotes = function() {
        return _.sortBy($scope.proposal.uniqueVotes(), function(vote) {
          return sortValueForVote(vote);
        });
      };
      $scope.voteIsMine = function(vote) {
        return vote.authorId === CurrentUser.id;
      };
      $scope.showChangeVoteOption = function(vote) {
        return AbilityService.canVoteOn($scope.proposal) && $scope.voteIsMine(vote);
      };
      return $scope.showUndecided = function() {
        return $scope.undecidedPanelOpen = true;
      };
    }
  };
});

angular.module('loomioApp').directive('proposalOutcomePanel', function() {
  return {
    scope: {
      proposal: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/thread_page/proposal_outcome_panel/proposal_outcome_panel.html',
    replace: true,
    controller: function($scope, AbilityService, ModalService, ProposalOutcomeForm) {
      $scope.canCreateOutcome = function() {
        return AbilityService.canCreateOutcomeFor($scope.proposal);
      };
      $scope.openProposalOutcomeForm = function() {
        return ModalService.open(ProposalOutcomeForm, {
          proposal: (function(_this) {
            return function() {
              return $scope.proposal;
            };
          })(this)
        });
      };
      $scope.canUpdateOutcome = function() {
        return AbilityService.canUpdateOutcomeFor($scope.proposal);
      };
    }
  };
});

angular.module('loomioApp').directive('proposalsCard', function() {
  return {
    scope: {},
    bindToController: {
      discussion: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/thread_page/proposals_card/proposals_card.html',
    replace: true,
    controllerAs: 'proposalsCard',
    controller: function(Records, CurrentUser) {
      Records.proposals.fetchByDiscussion(this.discussion);
      Records.votes.fetchMyVotes(this.discussion);
      this.isExpanded = function(proposal) {
        if (this.selectedProposal != null) {
          return proposal.id === this.selectedProposal.id;
        } else {
          return proposal.isActive();
        }
      };
      this.selectProposal = (function(_this) {
        return function(proposal) {
          return _this.selectedProposal = proposal;
        };
      })(this);
      this.canStartProposal = (function(_this) {
        return function() {
          return AbilityService.canStartProposal(_this.discussion);
        };
      })(this);
    }
  };
});

angular.module('loomioApp').factory('RevisionHistoryModal', function() {
  return {
    templateUrl: 'generated/components/thread_page/revision_history_modal/revision_history_modal.html',
    controller: function($scope, model, CurrentUser, Records, LoadingService) {
      $scope.model = model;
      $scope.loading = true;
      $scope.load = function() {
        switch ($scope.model.constructor.singular) {
          case 'discussion':
            return Records.versions.fetchByDiscussion($scope.model.key);
          case 'comment':
            return Records.versions.fetchByComment($scope.model.id);
        }
      };
      $scope.header = (function() {
        switch ($scope.model.constructor.singular) {
          case 'discussion':
            return 'revision_history_modal.thread_header';
          case 'comment':
            return 'revision_history_modal.comment_header';
        }
      })();
      $scope.discussionRevision = function() {
        return $scope.model.constructor.singular === 'discussion';
      };
      $scope.commentRevision = function() {
        return $scope.model.constructor.singular === 'comment';
      };
      $scope.threadTitle = function(version) {
        return $scope.model.attributeForVersion('title', version);
      };
      $scope.revisionBody = function(version) {
        switch ($scope.model.constructor.singular) {
          case 'discussion':
            return $scope.model.attributeForVersion('description', version);
          case 'comment':
            return $scope.model.attributeForVersion('body', version);
        }
      };
      $scope.threadDetails = function(version) {
        if (version.isOriginal()) {
          return 'revision_history_modal.started_by';
        } else {
          return 'revision_history_modal.edited_by';
        }
      };
      $scope.versionCreatedAt = function(version) {
        return moment(version).format('Do MMMM YYYY, h:mma');
      };
      LoadingService.applyLoadingFunction($scope, 'load');
      $scope.load();
    }
  };
});

angular.module('loomioApp').directive('undecidedPanel', function() {
  return {
    scope: {
      proposal: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/thread_page/undecided_panel/undecided_panel.html',
    replace: true,
    controller: function($scope, $timeout, Records) {
      $scope.undecidedPanelOpen = false;
      $scope.showUndecided = function() {
        $scope.proposal.fetchUndecidedMembers();
        $scope.undecidedPanelOpen = true;
        return $timeout(function() {
          return document.querySelector('.undecided-panel__heading').focus();
        });
      };
      return $scope.hideUndecided = function() {
        return $scope.undecidedPanelOpen = false;
      };
    }
  };
});

angular.module('loomioApp').factory('VoteForm', function() {
  return {
    templateUrl: 'generated/components/thread_page/vote_form/vote_form.html',
    controller: function($scope, vote, CurrentUser, FlashService, FormService, KeyEventService, EmojiService) {
      $scope.vote = vote.clone();
      $scope.editing = false;
      $scope.$on('modal.closing', function(event) {
        return FormService.confirmDiscardChanges(event, $scope.vote);
      });
      $scope.submit = FormService.submit($scope, $scope.vote, {
        flashSuccess: 'vote_form.messages.created'
      });
      $scope.yourLastVote = function() {
        return $scope.vote.proposal().lastVoteByUser(CurrentUser);
      };
      $scope.statementSelector = '.vote-form__statement-field';
      EmojiService.listen($scope, $scope.vote, 'statement', $scope.statementSelector);
      return KeyEventService.submitOnEnter($scope);
    }
  };
});

angular.module('loomioApp').factory('ChoosePlanModal', function() {
  return {
    templateUrl: 'generated/components/group_page/trial_card/choose_plan_modal/choose_plan_modal.html',
    size: 'choose-plan-modal',
    controller: function($scope, group, ModalService, ConfirmGiftPlanModal, ChargifyService, AppConfig, $window, IntercomService) {
      $scope.group = group;
      $scope.chooseGiftPlan = function() {
        return ModalService.open(ConfirmGiftPlanModal, {
          group: function() {
            return $scope.group;
          }
        });
      };
      $scope.choosePaidPlan = function(kind) {
        return $window.location = "" + AppConfig.chargify.host + AppConfig.chargify.plans[kind].path + "?" + (ChargifyService.encodedParams($scope.group));
      };
      return $scope.openIntercom = function() {
        IntercomService.contactUs();
        return $scope.$close();
      };
    }
  };
});

angular.module('loomioApp').factory('ConfirmGiftPlanModal', function() {
  return {
    templateUrl: 'generated/components/group_page/trial_card/confirm_gift_plan_modal/confirm_gift_plan_modal.html',
    size: 'confirm-gift-plan-modal',
    controller: function($scope, group, ModalService, ChoosePlanModal, DonationModal) {
      $scope.group = group;
      $scope.choosePlan = function() {
        return ModalService.open(ChoosePlanModal, {
          group: function() {
            return $scope.group;
          }
        });
      };
      return $scope.submit = function() {
        return $scope.group.remote.postMember(group.key, 'use_gift_subscription').then(function() {
          ModalService.open(DonationModal, {
            group: function() {
              return $scope.group;
            }
          });
          return $scope.$close();
        });
      };
    }
  };
});

angular.module('loomioApp').factory('DonationModal', function() {
  return {
    templateUrl: 'generated/components/group_page/trial_card/donation_modal/donation_modal.html',
    size: 'confirm-gift-plan-modal',
    controller: function($scope, group, $window, AppConfig, ChargifyService) {
      $scope.group = group;
      return $scope.makeDonation = function() {
        $window.open(AppConfig.chargify.donation_url + "?" + (ChargifyService.encodedParams($scope.group)), '_blank');
        return true;
      };
    }
  };
});

angular.module('loomioApp').directive('proposalActionsDropdown', function() {
  return {
    scope: {
      proposal: '='
    },
    restrict: 'E',
    templateUrl: 'generated/components/thread_page/current_proposal_card/proposal_actions_dropdown/proposal_actions_dropdown.html',
    replace: true,
    controller: function($scope, ModalService, ProposalForm, AbilityService, CloseProposalForm, ExtendProposalForm) {
      $scope.canCloseOrExtendProposal = function() {
        return AbilityService.canCloseOrExtendProposal($scope.proposal);
      };
      $scope.canEditProposal = function() {
        return AbilityService.canEditProposal($scope.proposal);
      };
      $scope.editProposal = function() {
        return ModalService.open(ProposalForm, {
          proposal: function() {
            return $scope.proposal.clone();
          }
        });
      };
      $scope.closeProposal = function() {
        return ModalService.open(CloseProposalForm, {
          proposal: function() {
            return $scope.proposal;
          }
        });
      };
      $scope.extendProposal = function() {
        return ModalService.open(ExtendProposalForm, {
          proposal: function() {
            return $scope.proposal;
          }
        });
      };
    }
  };
});

angular.module("loomioApp").run(["$templateCache", function($templateCache) {$templateCache.put("generated/components/archive_group_form/archive_group_form.html","<form ng-submit=\"submit()\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"group_page.deactivate_group.title\" class=\"lmo-h1\"></h1></div><div class=\"modal-body\"><span translate=\"group_page.deactivate_group.question\"></span></div><div class=\"modal-footer\"><button type=\"submit\" translate=\"group_page.deactivate_group.submit\" class=\"lmo-btn--submit archive-group-form__submit\"></button><button ng-click=\"$close()\" type=\"button\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button></div></form>");
$templateCache.put("generated/components/attachment_preview/attachment_preview.html","<div class=\"blank\"> <a lmo-href=\"{{attachment.original}}\" target=\"_blank\" class=\"attachment-preview__link\"><div ng-if=\"mode == \'thread\'\" class=\"attachment-preview attachment-preview--thread\"><div ng-if=\"attachment.isAnImage\" class=\"attachment-preview__image\"><img ng-src=\"{{location()}}\" alt=\"{{ \'activity_card.attachment_display.image_alt\' | translate }}\"></div><div ng-class=\"{\'attachment-preview__file--image\': attachment.isAnImage}\" class=\"attachment-preview__file attachment-preview__file--thread\"> <i class=\"fa fa-lg fa-paperclip\"></i>  <span>{{attachment.filename}}</span> <span>{{attachment.formattedFilesize()}}</span></div></div><div ng-if=\"mode == \'thumb\'\" title=\"{{attachment.filename}}\" class=\"attachment-preview attachment-preview--thumb\"><img ng-if=\"attachment.isAnImage\" ng-src=\"{{location()}}\" alt=\"{{ \'activity_card.attachment_display.image_alt\' | translate }}\" class=\"attachment-preview__image\"><div ng-if=\"!attachment.isAnImage\" class=\"attachment-preview__file attachment-preview__file--thumb\"><i class=\"fa fa-lg fa-paperclip\"></i></div><button ng-if=\"!attachment.commentId\" ng-click=\"destroy($event)\" title=\"{{ \'comment_form.attachments.remove_attachment\' | translate }}\" class=\"close attachment-preview__destroy\"><span aria-hidden=\"true\">&times;</span></button></div></a> </div>");
$templateCache.put("generated/components/authorized_apps_page/authorized_apps_page.html","<div class=\"lmo-one-column-layout\"><loading ng-show=\"authorizedAppsPage.loading\"></loading><main ng-if=\"!authorizedAppsPage.loading\" class=\"authorized-apps-page\"><h1 translate=\"authorized_apps_page.title\" class=\"lmo-h1\"></h1><hr><div ng-if=\"authorizedAppsPage.applications().length == 0\" translate=\"authorized_apps_page.no_applications\" class=\"lmo-placeholder\"></div><div ng-if=\"authorizedAppsPage.applications().length &gt; 0\" class=\"authorized-apps-page__table\"><div translate=\"authorized_apps_page.notice\" class=\"lmo-placeholder\"></div><div ng-repeat=\"application in authorizedAppsPage.applications() | orderBy: \'name\' track by application.id\" class=\"row authorized-apps-page__table-row\"><div class=\"col-xs-1 align-right\"> <img ng-src=\"{{application.logoUrl}}\" class=\"authorized-apps-page__avatar\"> </div><div class=\"col-xs-7\"><div class=\"authorized-apps-page__name\">{{ application.name }}</div></div><div class=\"col-xs-4 align-center\"><button ng-click=\"authorizedAppsPage.openRevokeForm(application)\" class=\"lmo-btn--danger\"><span translate=\"authorized_apps_page.revoke\"></span></button></div><div class=\"clearfix\"></div></div></div></main></div>");
$templateCache.put("generated/components/change_password_form/change_password_form.html","<form ng-submit=\"submit()\"><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"profile_page.change_password.title\" class=\"lmo-h1\"></h1></div><div class=\"modal-body\"><div translate=\"profile_page.change_password.helptext\"></div><label for=\"user-current-password-field\" translate=\"profile_page.change_password.current_password_label\"></label><input type=\"password\" ng-model=\"user.currentPassword\" class=\"profile-page__current-password-input form-control\" id=\"user-current-password-field\"><validation_errors subject=\"user\" field=\"currentPassword\"></validation_errors><label for=\"user-new-password-field\" translate=\"profile_page.change_password.new_password_label\"></label><input type=\"password\" ng-model=\"user.password\" class=\"profile-page__new-password-input form-control\" id=\"user-new-password-field\"><validation_errors subject=\"user\" field=\"password\"></validation_errors><label for=\"user-password-confirmation-field\" translate=\"profile_page.change_password.password_confirmation_label\"></label><input type=\"password\" ng-model=\"user.passwordConfirmation\" class=\"profile-page__password-confirmation-input form-control\" id=\"user-password-confirmation-field\"><validation_errors subject=\"user\" field=\"confirmPassword\"></validation_errors></div><div class=\"modal-footer\"><button type=\"submit\" translate=\"profile_page.change_password.submit\" class=\"lmo-btn--submit\"></button><button ng-click=\"$close()\" type=\"button\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button></div></form>");
$templateCache.put("generated/components/change_picture_form/change_picture_form.html","<div class=\"change-picture-form\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"profile_page.change_picture.title\" class=\"lmo-h1\"></h1></div><div class=\"modal-body\"><div translate=\"profile_page.change_picture.helptext\" class=\"change-picture-form__helptext\"></div><ul class=\"change-picture-form__options-list\"><li class=\"change-picture-form__option\"><button ng-click=\"submit(\'initials\')\" class=\"lmo-btn-link\"><div class=\"user-avatar lmo-box--small option-icon lmo-float--left\"><div class=\"user-avatar__initials--small\">{{user.avatarInitials}}</div></div><span translate=\"profile_page.change_picture.use_initials\" class=\"lmo-option-text\"></span></button></li><li class=\"change-picture-form__option\"><button ng-click=\"submit(\'gravatar\')\" class=\"lmo-btn-link\"><div class=\"user-avatar lmo-box--small option-icon lmo-float--left\"><img gravatar-src-once=\"user.gravatarMd5\" alt=\"{{::user.name}}\" class=\"user-avatar__image--small\"></div><span translate=\"profile_page.change_picture.use_gravatar\" class=\"lmo-option-text\"></span></button></li><li class=\"change-picture-form__option\"><button ng-click=\"selectFile()\" class=\"lmo-btn-link change-picture-form__upload-button\"><div class=\"user-avatar lmo-box--small option-icon lmo-float--left\"><div class=\"user-avatar__initials--small\"><i class=\"fa fa-lg fa-camera\"></i></div></div><span translate=\"profile_page.change_picture.use_uploaded\" class=\"lmo-option-text\"></span></button><input type=\"file\" ng-model=\"files\" ng-file-select=\"upload(files)\" class=\"hidden change-picture-form__file-input\"></li></ul></div><div class=\"modal-footer\"><button ng-click=\"$close()\" type=\"button\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button></div></div>");
$templateCache.put("generated/components/change_volume_form/change_volume_form.html","<div class=\"change-volume-form\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><form ng-submit=\"submit()\"><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"{{translateKey()}}.title\" translate-value-title=\"{{model.title || model.groupName()}}\" class=\"lmo-h1 change-volume-form__title\"></h1></div><div class=\"modal-body\"><ul class=\"change-volume-form__list\"><li ng-repeat=\"level in volumeLevels\" class=\"change-volume-form__option\"><input id=\"volume-{{level}}\" type=\"radio\" ng-model=\"buh.volume\" name=\"volume\" value=\"{{level}}\" class=\"change-volume-form__input\"><label for=\"volume-{{level}}\" class=\"change-volume-form__label\"><strong translate=\"change_volume_form.{{level}}_label\"></strong><p translate=\"{{translateKey()}}.{{level}}_description\" class=\"change-volume-form__description\"></p></label></li></ul><input type=\"checkbox\" ng-model=\"applyToAll\" class=\"change-volume-form__apply-to-all\" id=\"apply-to-all\"><label for=\"apply-to-all\" translate=\"{{translateKey()}}.apply_to_all\" class=\"change-volume-form__apply-to-all-label\"></label></div><div class=\"modal-footer\"><a href=\"https://loomio.gitbooks.io/manual/content/en/keeping_up_to_date.html\" translate=\"common.help\" target=\"_blank\" class=\"change-volume-form__help\"></a><button type=\"submit\" ng-disabled=\"isDisabled\" translate=\"common.action.update\" class=\"change-volume-form__submit\"></button><button type=\"button\" translate=\"common.action.cancel\" ng-click=\"$close()\" class=\"change-volume-form__cancel\"></button></div></form></div>");
$templateCache.put("generated/components/contact_page/contact_page.html","<form name=\"groupForm\" ng_submit=\"submit()\" class=\"form-card\"><h1 translate=\"contact_message_form.contact_us\" class=\"lmo-h1\"></h1><div class=\"lmo-form-group\"><label for=\"contact-name-field\" translate=\"contact_message_form.name_label\"></label><input ng-model=\"message.name\" ng_required=\"true\" placeholder=\"{{contact_message_form.name_placeholder | translate}}\" class=\"form-control\" id=\"contact-name-field\"><label for=\"contact-email-field\" translate=\"contact_message_form.email_label\"></label><input ng-model=\"message.email\" ng_required=\"true\" placeholder=\"{{contact_message_form.email_placeholder | translate}}\" class=\"form-control\" id=\"contact-email-field\"><label for=\"contact-message-field\" translate=\"contact_message_form.message_label\"></label><textarea ng-model=\"message.message\" placeholder=\"{{contact_message_form.message_placeholder | translate}}\" id=\"contact-message-field\"></textarea></div><button type=\"submit\" translate=\"contact_message_form.send_message\" class=\"lmo-btn--submit\"></button></form>");
$templateCache.put("generated/components/dashboard_page/dashboard_page.html","<div class=\"lmo-one-column-layout\"><main class=\"dashboard-page lmo-row\"><section aria-label=\"{{ \'dashboard_page.options.aria_label\' | translate }}\" class=\"dashboard-page__options\"><div uib-dropdown=\"true\" class=\"dashboard-page__filter-dropdown\"><button uib-dropdown-toggle=\"true\" class=\"lmo-btn--nude\"><span><div translate=\"dashboard_page.filtering.filter_threads_aria_label\" class=\"sr-only\"></div> <span translate=\"dashboard_page.filtering.filter_threads\" aria-hidden=\"true\"></span> </span><i class=\"fa fa-chevron-down\"></i></button><div role=\"menu\" class=\"uib-dropdown-menu lmo-dropdown-menu lmo-dropdown-menu--with-details\"><ul class=\"lmo-dropdown-menu-items filtering-options\"><li class=\"lmo-dropdown-menu-item filtering-option dashboard-page__filter-recent\"><a ng-click=\"dashboardPage.setFilter(\'show_all\')\"><div class=\"lmo-dropdown-menu-item-label\"> <span translate=\"dashboard_page.filtering.all\" aria-hidden=\"true\"></span> <i ng-show=\"dashboardPage.filter == \'show_all\'\" class=\"fa fa-lg fa-check\"></i></div><div translate=\"dashboard_page.filtering.all_description\" class=\"lmo-dropdown-menu-item-details\"></div></a></li><li class=\"lmo-dropdown-menu-item filtering-option dashboard-page__filter-participating\"><a ng-click=\"dashboardPage.setFilter(\'show_participating\')\"><div class=\"lmo-dropdown-menu-item-label\"> <span translate=\"dashboard_page.filtering.participating\" aria-hidden=\"true\"></span> <i ng-show=\"dashboardPage.filter == \'show_participating\'\" class=\"fa fa-lg fa-check\"></i></div><div translate=\"dashboard_page.filtering.participating_description\" class=\"lmo-dropdown-menu-item-details\"></div></a></li><li class=\"lmo-dropdown-menu-item filtering-option dashboard-page__filter-muted\"><a ng-click=\"dashboardPage.setFilter(\'show_muted\')\"><div class=\"lmo-dropdown-menu-item-label\"> <span translate=\"dashboard_page.filtering.muted\" aria-hidden=\"true\"></span> <i ng-show=\"dashboardPage.filter == \'show_muted\'\" class=\"fa fa-lg fa-check\"></i></div><div translate=\"dashboard_page.filtering.muted_description\" class=\"lmo-dropdown-menu-item-details\"></div></a></li></ul></div></div></section><h1 translate=\"dashboard_page.filtering.all\" ng-show=\"dashboardPage.filter == \'show_all\'\" class=\"lmo-h1-medium dashboard-page__heading\"></h1><h1 translate=\"dashboard_page.filtering.participating\" ng-show=\"dashboardPage.filter == \'show_participating\'\" class=\"lmo-h1-medium dashboard-page__heading\"></h1><h1 translate=\"dashboard_page.filtering.muted\" ng-show=\"dashboardPage.filter == \'show_muted\'\" class=\"lmo-h1-medium dashboard-page__heading\"></h1><div ng-hide=\"dashboardPage.loadMoreExecuting || dashboardPage.currentBaseQuery.any()\" class=\"dashboard-page__no-threads\"> <span ng-show=\"dashboardPage.filter == \'show_all\'\" translate=\"dashboard_page.no_threads.show_all\"></span>  <span ng-show=\"dashboardPage.filter == \'show_participating\'\" translate=\"dashboard_page.no_threads.show_participating\"></span>  <span ng-show=\"dashboardPage.filter == \'show_muted\'\" translate=\"dashboard_page.no_threads.show_muted\"></span>  <a ng-show=\"dashboardPage.filter != \'show_all\'\" translate=\"dashboard_page.view_recent\" ng-click=\"dashboardPage.setFilter(\'show_all\')\"></a> </div><div ng-if=\"!dashboardPage.displayByGroup()\" class=\"dashboard-page__collections\"><section ng-if=\"dashboardPage.views.recent[viewName].any()\" class=\"thread-preview-collection__container dashboard-page__{{viewName}}\" ng-repeat=\"viewName in dashboardPage.recentViewNames\"><h2 translate=\"dashboard_page.threads_from.{{viewName}}\" class=\"dashboard-page__date-range\"></h2><thread_preview_collection query=\"dashboardPage.views.recent[viewName]\" class=\"thread-previews-container\"></thread_preview_collection></section><div in-view=\"$inview &amp;&amp; dashboardPage.loadMore()\" in-view-options=\"{debounce: 200}\" class=\"dashboard-page__footer\">.</div><loading ng-show=\"dashboardPage.loadMoreExecuting\"></loading></div><div ng-if=\"dashboardPage.displayByGroup()\" class=\"dashboard-page__collections\"><div ng-repeat=\"group in dashboardPage.groups() | orderBy:\'name\' track by group.id\" class=\"dashboard-page__group\"><section ng-if=\"dashboardPage.views.groups[group.key].any()\" role=\"region\" aria-label=\"{{ \'dashboard_page.threads_from.group\' | translate }} {{group.name}}\"> <img ng-src=\"{{group.logoUrl()}}\" aria-hidden=\"true\" class=\"selector-list-item-group-logo pull-left\"> <h2 class=\"dashboard-page__group-name\"><a lmo-href-for=\"group\">{{group.name}}</a></h2><div class=\"dashboard-groups thread-previews-container\"><thread_preview_collection query=\"dashboardPage.views.groups[group.key]\" limit=\"dashboardPage.groupThreadLimit\"></thread_preview_collection></div></section></div><loading ng-show=\"dashboardPage.loadMoreExecuting\"></loading></div></main></div>");
$templateCache.put("generated/components/deactivate_user_form/deactivate_user_form.html","<form ng-submit=\"submit()\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"profile_page.deactivate_user.title\" class=\"lmo-h1\"></h1></div><div class=\"modal-body\"><h4 translate=\"profile_page.deactivate_user.question\" class=\"lmo-h4\"></h4><textarea ng-model=\"user.deactivationResponse\" placeholder=\"{{ \'profile_page.deactivate_user.placeholder\' | translate }}\" class=\"lmo-textarea form-control\"></textarea></div><div class=\"modal-footer\"><button type=\"submit\" translate=\"profile_page.deactivate_user.submit\" class=\"lmo-btn--danger\"></button><button ng-click=\"$close()\" type=\"button\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button></div></form>");
$templateCache.put("generated/components/delete_thread_form/delete_thread_form.html","<form ng-submit=\"submit()\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><div class=\"delete-thread-form\"><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"delete_thread_form.title\" class=\"lmo-h1\"></h1></div><div class=\"modal-body\"><span translate=\"delete_thread_form.body\"></span></div><div class=\"modal-footer\"><button type=\"submit\" translate=\"delete_thread_form.confirm\" class=\"lmo-btn--danger delete_thread_form__submit\"></button><button ng-click=\"$close()\" type=\"button\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button></div></div></form>");
$templateCache.put("generated/components/discussion_form/discussion_form.html","<form name=\"discussionForm\" ng_submit=\"submit()\" ng-disabled=\"isDisabled\" class=\"discussion-form\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><input type=\"hidden\" ng-model=\"discussion.usesMarkdown\"><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"discussion_form.new_discussion_title\" ng-show=\"discussion.isNew()\" class=\"lmo-h1 modal-title\"></h1><h1 translate=\"discussion_form.edit_discussion_title\" ng-hide=\"discussion.isNew()\" class=\"lmo-h1 modal-title\"></h1></div><div class=\"modal-body\"><form_errors record=\"discussion\"></form_errors><div translate=\"discussion_form.discussion_helptext\" ng-show=\"discussion.isNew()\" class=\"thread-helptext\"></div><div ng-show=\"showGroupSelect\" class=\"lmo-form-group\"><label for=\"discussion-group-field\" translate=\"discussion_form.group_label\"></label><select ng-model=\"discussion.groupId\" ng-required=\"true\" ng-options=\"group.id as group.fullName for group in availableGroups() | orderBy: \'fullName\'\" ng-change=\"restoreRemoteDraft(); updatePrivacy()\" class=\"form-control\" id=\"discussion-group-field\"><option translate=\"discussion_form.group_placeholder\"></option></select></div><div ng_if=\"discussion.groupId\" class=\"discussion-group-selected\"><div class=\"lmo-form-group\"><label for=\"discussion-title\" translate=\"discussion_form.title_label\"></label><div class=\"lmo-relative\"><input placeholder=\"{{ \'discussion_form.title_placeholder\' | translate }}\" ng-model=\"discussion.title\" ng-model-options=\"{debounce: 600}\" ng-change=\"storeDraft()\" ng-required=\"true\" maxlength=\"255\" class=\"discussion-form__title-input form-control lmo-primary-form-input\" id=\"discussion-title\"></div><validation_errors subject=\"discussion\" field=\"title\"></validation_errors></div><div class=\"lmo-form-group\"><label for=\"discussion-context\" translate=\"discussion_form.context_label\"></label><div class=\"lmo-relative\"><textarea msd-elastic=\"true\" ng-model=\"discussion.description\" ng-model-options=\"{debounce: 600}\" ng-change=\"storeDraft()\" placeholder=\"{{ \'discussion_form.context_placeholder\' | translate }}\" class=\"lmo-textarea discussion-form__description-input form-control lmo-primary-form-input\" id=\"discussion-context\"></textarea><emoji_picker target-selector=\"descriptionSelector\" class=\"lmo-action-dock\"></emoji_picker></div></div><div ng-show=\"showPrivacyForm()\" class=\"lmo-form-group\"><label class=\"lmo-form-labelled-input discussion-form__public\"><input type=\"radio\" ng-model=\"discussion.private\" ng-value=\"false\"><span> <i class=\"fa fa-globe\"></i> <strong translate=\"common.privacy.public\"></strong><span class=\"seperator\"></span><span translate=\"discussion_form.privacy_public\"></span></span></label><label class=\"lmo-form-labelled-input discussion-form__private\"><input type=\"radio\" ng-model=\"discussion.private\" ng-value=\"true\"><span> <i class=\"fa fa-lock\"></i> <strong translate=\"common.privacy.private\"></strong><span class=\"seperator\"></span><span>{{ privacyPrivateDescription() }}</span></span></label></div><div ng-show=\"!showPrivacyForm()\" class=\"privacy-notice\"><label ng_hide=\"discussion.private\" class=\"lmo-form-labelled-input\"><span> <i class=\"fa fa-globe\"></i> <strong translate=\"common.privacy.public\"></strong><span class=\"seperator\"></span><span translate=\"discussion_form.privacy_public\"></span></span></label><label ng-show=\"discussion.private\" class=\"lmo-form-labelled-input\"><span> <i class=\"fa fa-lock\"></i> <strong translate=\"common.privacy.private\"></strong><span class=\"seperator\"></span><span>{{ privacyPrivateDescription() }}</span></span></label></div></div></div><div class=\"modal-footer\"><button type=\"submit\" translate=\"discussion_form.new_discussion_submit\" ng-show=\"discussion.isNew()\" class=\"pull-right lmo-btn--submit discussion-form__submit\"></button><a lmo-href=\"/markdown\" tabindex=\"0\" target=\"_blank\" title=\"{{ \'common.formatting_help.title\' | translate }}\" class=\"discussion-form__formatting-help\"><span translate=\"common.formatting_help.label\"></span></a><button type=\"submit\" translate=\"discussion_form.edit_discussion_submit\" ng-hide=\"discussion.isNew()\" class=\"lmo-btn--primary discussion-form__update\"></button><button type=\"button\" ng-click=\"$close()\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel discussion-form__cancel\"></button></div></form>");
$templateCache.put("generated/components/email_settings_page/email_settings_page.html","<div class=\"lmo-one-column-layout\"><main class=\"email-settings-page\"><div class=\"lmo-page-heading\"><h1 translate=\"email_settings_page.header\" class=\"lmo-h1-medium\"></h1></div><div class=\"email-settings-page__email-settings\"><div class=\"email-settings-page__global-settings\"><h3 translate=\"email_settings_page.all_groups\" class=\"lmo-h3\"></h3><form ng-submit=\"emailSettingsPage.submit()\"><div class=\"email-settings-page__global-email-settings-options\"><div class=\"email-settings-page__field\"><input type=\"checkbox\" ng-model=\"emailSettingsPage.user.emailMissedYesterday\" class=\"email-settings-page__daily-summary\" id=\"daily-summary-email\"><label for=\"daily-summary-email\" translate=\"email_settings_page.daily_summary_label\"></label><div translate=\"email_settings_page.daily_summary_description\" class=\"email-settings-page__input-description\"></div></div><div class=\"email-settings-page__field\"><input type=\"checkbox\" ng-model=\"emailSettingsPage.user.emailOnParticipation\" class=\"email-settings-page__on-participation\" id=\"on-participation-email\"><label for=\"on-participation-email\" translate=\"email_settings_page.on_participation_label\"></label><div translate=\"email_settings_page.on_participation_description\" class=\"email-settings-page__input-description\"></div></div><div class=\"email-settings-page__field\"><input type=\"checkbox\" ng-model=\"emailSettingsPage.user.emailWhenMentioned\" class=\"email-settings-page__mentioned\" id=\"mentioned-email\"><label for=\"mentioned-email\" translate=\"email_settings_page.mentioned_label\"></label><div translate=\"email_settings_page.mentioned_description\" class=\"email-settings-page__input-description\"></div></div></div><button type=\"submit\" ng-disabled=\"isDisabled\" translate=\"email_settings_page.update_settings\" class=\"email-settings-page__update-button\"></button></form></div><div class=\"email-settings-page__specific-group-settings\"><h3 translate=\"email_settings_page.specific_groups\" class=\"lmo-h3\"></h3><span translate=\"email_settings_page.default_settings\"></span><button ng-click=\"emailSettingsPage.changeDefaultMembershipVolume()\" translate=\"email_settings_page.change_default\" class=\"email-settings-page__change-default-link lmo-btn-link\"></button><ul class=\"email-settings-page__groups\"><li ng-repeat=\"group in emailSettingsPage.user.groups() track by group.id\" class=\"email-settings-page__group\"><img ng-src=\"{{group.logoUrl()}}\" class=\"lmo-box--medium\"><div class=\"email-settings-page__group-details\"><strong class=\"email-settings-page__group-name\"> <span ng-if=\"group.isSubgroup()\">{{group.parentName()}} -</span> <span>{{group.name}}</span></strong><p translate=\"change_volume_form.{{emailSettingsPage.groupVolume(group)}}_label\" class=\"email-settings-page__membership-volume\"></p></div><div class=\"email-settings-page__edit\"><button ng-click=\"emailSettingsPage.editSpecificGroupVolume(group)\" translate=\"email_settings_page.edit\" class=\"email-settings-page__edit-membership-volume-link lmo-btn-link\"></button></div></li></ul><a href=\"https://loomio.gitbooks.io/manual/content/en/keeping_up_to_date.html\" target=\"_blank\" translate=\"Learn more about email settings...\" class=\"email-settings-page__learn-more-link\"></a></div></div></main></div>");
$templateCache.put("generated/components/emoji_picker/emoji_picker.html","<div aria-hidden=\"true\" off-click=\"hideMenu()\" class=\"emoji-picker\"><button type=\"button\" tabindex=\"-1\" ng-click=\"toggleMenu()\" class=\"btn btn-nude emoji-picker__toggle\"><i class=\"fa fa-smile-o\"></i></button><div ng-if=\"showMenu\" class=\"emoji-picker__menu\"><div ng-show=\"hovered.name\" class=\"emoji-picker__preview\"> <span ng-bind-html=\"hovered.image\"></span> <span class=\"emoji-picker__hovered-name\">{{ hovered.name }}</span><hr class=\"emoji-picker__hr\"></div><div ng-if=\"noEmojisFound()\" translate=\"emoji_picker.no_emojis_found\" translate-value-term=\"{{term}}\" class=\"emoji-picker__none-found\"></div><div ng-repeat=\"emoji in source\" class=\"emoji-picker__selector\"><a ng-click=\"select(emoji)\" ng-mouseover=\"hover(emoji)\" class=\"emoji-picker__link\"><div ng-bind-html=\"render(emoji)\" class=\"emoji-picker__icon\"></div></a></div><input ng-model=\"term\" ng-change=\"search(term)\" placeholder=\"{{\'emoji_picker.search\' | translate}}\" class=\"emoji-picker__search form-control\"></div></div>");
$templateCache.put("generated/components/error_page/error_page.html","<div class=\"error-page\"><div translate=\"error_page.forbidden\" ng-if=\"error.status == 403\" class=\"error-page__forbidden\"></div><div translate=\"error_page.page_not_found\" ng-if=\"error.status == 404\" class=\"error-page__page-not-found\"></div><div translate=\"error_page.internal_server_error\" ng-if=\"error.status == 500\" class=\"error-page__internal-server-error\"></div></div>");
$templateCache.put("generated/components/flash/flash.html","<div aria-live=\"{{ariaLive()}}\" role=\"alert\" class=\"flash-root\"><div ng-show=\"display()\" ng-animate=\"\'enter\'\" class=\"flash-root__container alert-{{flash.level}}\"><div class=\"flash-root__message\"><loading ng-if=\"loading()\" class=\"flash-root__loading\"></loading>{{ flash.message | translate:flash.options }}</div><div ng-if=\"flash.actionFn\" class=\"flash-root__action\"><a ng-click=\"flash.actionFn()\" translate=\"{{flash.action}}\"></a></div></div></div>");
$templateCache.put("generated/components/form_errors/form_errors.html","<div ng-hide=\"record.isValid()\" ng-animate=\"\'enter\'\" class=\"form-errors\"><ul><li ng-repeat=\"error in record.errors\"># translation soon{{error}}</li></ul></div>");
$templateCache.put("generated/components/group_avatar/group_avatar.html","<div class=\"group-avatar lmo-box--{{size}}\" aria-hidden=\"true\"><img class=\"lmo-box--{{size}}\" alt=\"{{group.name}}\" ng-src=\"{{::group.logoUrl()}}\"></div>");
$templateCache.put("generated/components/group_form/group_form.html","<div class=\"group-form\"><form ng-submit=\"submit()\" ng-disabled=\"group.processing\" name=\"groupForm\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"{{i18n.heading}}\" class=\"lmo-h1\"></h1></div><div class=\"modal-body\"><div class=\"group-form__basic\"><div class=\"group-form__name\"><label for=\"group-name\" translate=\"{{i18n.group_name}}\"></label><input placeholder=\"{{ \'group_form.group_name_placeholder\' | translate }}\" ng-required=\"ng-required\" ng-model=\"group.name\" ng-model-options=\"{debounce: 600}\" ng-change=\"storeDraft()\" maxlength=\"255\" class=\"form-control\" id=\"group-name\"><validation_errors subject=\"group\" field=\"name\"></validation_errors></div><div class=\"group-form__description\"><label for=\"group-description\" translate=\"group_form.description\"></label><textarea placeholder=\"{{ \'group_form.description_placeholder\' | translate }}\" msd-elastic=\"true\" ng-model=\"group.description\" ng-model-options=\"{debounce: 600}\" ng-change=\"storeDraft()\" class=\"lmo-textarea form-control\" id=\"group-description\"></textarea></div><div class=\"group-form__privacy-statement\">{{privacyStatement()}}</div><div class=\"group-form__privacy lmo-form-group\"><label translate=\"group_form.privacy\"></label><label ng-if=\"!group.isSubgroupOfSecretParent()\" class=\"lmo-form-labelled-input\"><input type=\"radio\" ng-model=\"group.groupPrivacy\" ng-change=\"groupPrivacyChanged()\" value=\"open\" name=\"groupPrivacy\" class=\"group-form__privacy-open\"><span><strong translate=\"common.privacy.open\"></strong><span class=\"seperator\"></span>{{ privacyStringFor(\"open\") }}</span></label><label class=\"lmo-form-labelled-input\"><input type=\"radio\" ng-model=\"group.groupPrivacy\" ng-change=\"groupPrivacyChanged()\" value=\"closed\" name=\"groupPrivacy\" class=\"group-form__privacy-closed\"><span><strong translate=\"common.privacy.closed\"></strong><span class=\"seperator\"></span>{{ privacyStringFor(\"closed\") }}</span></label><label class=\"lmo-form-labelled-input\"><input type=\"radio\" ng-model=\"group.groupPrivacy\" ng-change=\"groupPrivacyChanged()\" value=\"secret\" name=\"groupPrivacy\" class=\"group-form__privacy-secret\"><span><strong translate=\"common.privacy.secret\"></strong><span class=\"seperator\"></span>{{ privacyStringFor(\"secret\") }}</span></label></div></div><button type=\"button\" ng-show=\"!expanded\" ng-click=\"expandForm()\" translate=\"group_form.advanced_settings\" class=\"lmo-link group-form__advanced-link\"></button><div ng-show=\"expanded\" class=\"group-form__advanced\"><div ng-if=\"group.privacyIsOpen()\" class=\"group-form__joining lmo-form-group\"><label translate=\"group_form.how_do_people_join\"></label><label class=\"lmo-form-labelled-input\"><input type=\"radio\" ng-model=\"group.membershipGrantedUpon\" value=\"request\" name=\"membership-granted-upon\" class=\"group-form__membership-granted-upon-request\"><span translate=\"group_form.membership_granted_upon_request\"></span></label><label class=\"lmo-form-labelled-input\"><input type=\"radio\" ng-model=\"group.membershipGrantedUpon\" value=\"approval\" name=\"membership-granted-upon\" class=\"group-form__membership-granted-upon-approval\"><span translate=\"group_form.membership_granted_upon_approval\"></span></label></div><div class=\"group-form__permissions lmo-form-group\"><label translate=\"group_form.permissions\"></label><label ng-if=\"group.privacyIsClosed() &amp;&amp; !group.isSubgroupOfSecretParent()\" class=\"lmo-form-labelled-input\"><input type=\"checkbox\" ng-model=\"buh.allowPublicThreads\" ng-change=\"allowPublicThreadsClicked()\" class=\"group-form__allow-public-threads\"><span translate=\"group_form.allow_public_threads\"></span></label><label ng-if=\"group.isSubgroup() &amp;&amp; group.privacyIsClosed()\" class=\"lmo-form-labelled-input\"><input type=\"checkbox\" ng-model=\"group.parentMembersCanSeeDiscussions\" class=\"group-form__parent-members-can-see-discussions\"><span translate=\"group_form.parent_members_can_see_discussions\" translate-value-parent=\"{{group.parent().name}}\"></span></label><label class=\"lmo-form-labelled-input\"><input type=\"checkbox\" ng-model=\"group.membersCanAddMembers\" class=\"group-form__members-can-add-members\"><span translate=\"group_form.members_can_add_members\"></span></label><label ng-if=\"group.isParent()\" class=\"lmo-form-labelled-input\"><input type=\"checkbox\" ng-model=\"group.membersCanCreateSubgroups\" class=\"group-form__members-can-create-subgroups\"><span translate=\"group_form.members_can_create_subgroups\"></span></label><label class=\"lmo-form-labelled-input\"><input type=\"checkbox\" ng-model=\"group.membersCanStartDiscussions\" class=\"group-form__members-can-start-discussions\"><span translate=\"group_form.members_can_start_discussions\"></span></label><label class=\"lmo-form-labelled-input\"><input type=\"checkbox\" ng-model=\"group.membersCanEditDiscussions\" class=\"group-form__members-can-edit-discussions\"><span translate=\"group_form.members_can_edit_discussions\"></span></label><label class=\"lmo-form-labelled-input\"><input type=\"checkbox\" ng-model=\"group.membersCanEditComments\" class=\"group-form__members-can-edit-comments\"><span translate=\"group_form.members_can_edit_comments\"></span></label><label class=\"lmo-form-labelled-input\"><input type=\"checkbox\" ng-model=\"group.membersCanRaiseMotions\" class=\"group-form__members-can-raise-motions\"><span translate=\"group_form.members_can_raise_motions\"></span></label><label class=\"lmo-form-labelled-input\"><input type=\"checkbox\" ng-model=\"group.membersCanVote\" class=\"group-form__members-can-vote\"><span translate=\"group_form.members_can_vote\"></span></label></div></div></div><div class=\"modal-footer\"><button ng-click=\"$close()\" type=\"button\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button><button type=\"submit\" translate=\"{{i18n.submit}}\" class=\"lmo-btn--submit group-form__submit-button\"></button></div></form></div>");
$templateCache.put("generated/components/group_page/group_page.html","<div class=\"loading-wrapper lmo-two-column-layout\"><loading ng-if=\"!groupPage.group\"></loading><main ng-if=\"groupPage.group\" class=\"group-page\"><group_theme group=\"groupPage.group\" home-page=\"true\"></group_theme><div class=\"lmo-row\"><div class=\"lmo-group-column-left\"><section aria-labelledby=\"description-card-title\" class=\"group-page__description\"><h2 translate=\"group_page.description\" class=\"lmo-card-heading\" id=\"description-card-title\"></h2><div translate=\"group_page.description_placeholder\" ng-if=\"groupPage.showDescriptionPlaceholder()\" class=\"group-page__description-placeholder lmo-placeholder lmo-hint-text\"></div><div marked=\"groupPage.group.description\" class=\"group-page__description-text lmo-last lmo-markdown-wrapper\"></div></section><discussions_card group=\"groupPage.group\"></discussions_card></div><div class=\"lmo-group-column-right\"><trial_card group=\"groupPage.group\"></trial_card><gift_card group=\"groupPage.group\"></gift_card><membership_requests_card group=\"groupPage.group\"></membership_requests_card><members_card group=\"groupPage.group\"></members_card><group_previous_proposals_card group=\"groupPage.group\"></group_previous_proposals_card><subgroups_card group=\"groupPage.group\"></subgroups_card><group_help_card group=\"groupPage.group\"></group_help_card></div></div></main></div>");
$templateCache.put("generated/components/groups_page/groups_page.html","<div class=\"lmo-one-column-layout\"><main class=\"groups-page\"><div class=\"row groups-page__heading\"><h1 translate=\"groups_page.page_header\" class=\"lmo-h1-medium\"></h1><button ng-click=\"groupsPage.startGroup()\" class=\"groups-page__new-group\"> <i class=\"fa fa-lg fa-plus\"></i> <span translate=\"navbar.user_options.new_group\"></span></button></div><div class=\"groups-page__groups\"><ul class=\"groups-page__parent-groups\"><li ng-repeat=\"group in groupsPage.parentGroups() | orderBy: \'name\' track by group.id\" class=\"groups-page__parent-group\"><div class=\"groups-page__parent-group-header clearfix\"> <img ng-src=\"{{group.logoUrl()}}\" aria-hidden=\"true\" class=\"groups-page__parent-group-logo\"> <h2 id=\"{{group.key}}\" class=\"groups-page__parent-group-name\"><a lmo-href-for=\"group\">{{group.name}}</a></h2></div><ul ng-if=\"group.subgroups().length &gt; 0\" class=\"groups-page__subgroups\"><li ng-repeat=\"subgroup in group.subgroups() | orderBy: \'name\' track by subgroup.id\" class=\"groups-page__subgroup\"><a lmo-href-for=\"subgroup\">{{subgroup.name}}</a></li></ul></li></ul></div></main></div>");
$templateCache.put("generated/components/help_page/help_page.html","<div class=\"form-card\"><div class=\"col-xs-12\" id=\"help-content\"><section id=\"how-it-works\"><div class=\"inner-container\"><div class=\"row\"><div class=\"subhead\"><h1 translate=\"help_page.how_it_works\" class=\"lmo-h1\"></h1></div></div><div class=\"row\" id=\"video-tutorial\"><div class=\"col-sm-12\"><h2 translate=\"help_page.video_tutorial\" class=\"lmo-h2\"></h2></div><div class=\"col-md-12\"><p translate=\"help_page.video_tutorial_description\"></p></div><div class=\"col-md-12\"><iframe width=\"356px\" height=\"267px\" src=\"//www.youtube.com/embed/eu6A1IQar0g\" frameborder=\"0\" allowfullscreen></iframe></div></div><div class=\"row\" id=\"getting-started\"><div class=\"col-sm-12\"><h2 translate=\"help_page.getting_started\" class=\"lmo-h2\"></h2></div><div class=\"col-sm-8\"><p translate=\"help_page.getting_started_description\"></p></div></div><div class=\"row\" id=\"have-a-discussion\"><div class=\"col-sm-12\"><h2 translate=\"help_page.have_a_discussion\" class=\"lmo-h2\"></h2></div><div class=\"col-sm-8\"><p translate=\"help_page.have_a_discussion_description\"></p></div></div><div class=\"row\" id=\"make-a-decision\"><div class=\"col-sm-12\"><h2 translate=\"help_page.make_a_decision\" class=\"lmo-h2\"></h2></div><div class=\"col-sm-8\"><p translate=\"help_page.make_a_decision_description\"></p></div></div><div class=\"row\" id=\"have-your-say\"><div class=\"col-sm-12\"><h2 translate=\"help_page.have_your_say\" class=\"lmo-h2\"></h2></div><div translate=\"help_page.have_your_say_details_html\" class=\"col-sm-6\"></div><div class=\"col-sm-6\"><div class=\"positions\"><p translate=\"help_page.positions_agree_description\"></p><p translate=\"help_page.positions_abstain_description\"></p><p translate=\"help_page.positions_disagree_description\"></p><p translate=\"help_page.positions_block_description\"></p></div></div></div><div class=\"row\" id=\"prompt-people\"><div class=\"col-md-10\"><h2 translate=\"help_page.prompt_people_html\" class=\"lmo-h2\"></h2></div></div><div class=\"row\"><div class=\"col-md-8\"><p translate=\"help_page.prompt_people_details\"></p></div></div><div class=\"row\" id=\"keep-up-to-date\"><div class=\"col-md-8\"><h2 translate=\"help_page.keep_up_to_date\" class=\"lmo-h2\"><a lmo-href=\"/email\"><span translate=\"help_page.keep_up_to_date_html\"></span></a></h2></div></div><div class=\"row\" id=\"images-and-text-formatting\"><div class=\"col-md-8\"><h2 translate=\"help_page.images_and_text_formatting\" class=\"lmo-h2\"></h2><span translate=\"help_page.images_and_text_formatting_html\"></span></div></div></div></section><section id=\"getting-the-most-out-of-Loomio\"><div class=\"inner-container\"><div class=\"row\"><h1 translate=\"help_page.getting_the_most\" class=\"lmo-h1\"></h1></div><div class=\"row\" id=\"starting-an-engaging-discussion\"><div class=\"col-md-10\"><h2 translate=\"help_page.start_discussion\" class=\"lmo-h2\"></h2></div></div><div class=\"row\"><div translate=\"help_page.start_discussion_html\" class=\"col-md-8\"></div></div><div class=\"row\" id=\"writing-a-clear-proposal\"><div class=\"col-md-8\"><h2 translate=\"help_page.start_proposal\" class=\"lmo-h2\"></h2><span translate=\"help_page.start_proposal_html\"></span></div></div><div class=\"row\" id=\"different-ways-to-use-Loomio\"><div class=\"col-md-9\"><h2 translate=\"help_page.different_ways\" class=\"lmo-h2\"></h2></div></div><div class=\"row\"><div class=\"col-md-8\"><div translate=\"help_page.example1_html\" class=\"example\"></div><div translate=\"help_page.example2_html\" class=\"example\"></div></div></div></div></section><section id=\"coordinating-your-Loomio-group\"><div class=\"inner-container\"><div class=\"row\"><h1 translate=\"help_page.coordinating\" class=\"lmo-h1\"></h1></div><div class=\"row\"><div class=\"col-md-8 extra-margin\"><p translate=\"help_page.coordinating_details\"></p></div></div><div class=\"row\" id=\"writing-a-great-invitation\"><div translate=\"help_page.invitation_html\" class=\"col-md-8\"></div></div><div class=\"row\" id=\"tips-for-engaging-your-group\"><div translate=\"help_page.engaging_html\" class=\"col-md-8\"></div></div></div></section><section id=\"get-in-touch\"><div class=\"inner-container\"><div class=\"row\"><h1 translate=\"help_page.get_in_touch\" class=\"lmo-h1\"></h1></div><div class=\"row\"><div class=\"col-md-8\"><a lmo-href=\"/contact\"><p translate=\"help_page.get_in_touch_description_html\" class=\"extra-margin\"></p></a></div></div><div class=\"row\" id=\"join-the-community\"><h1 translate=\"help_page.join_the_community\" class=\"lmo-h1\"></h1></div><div class=\"row\"><div class=\"col-md-8\"><p translate=\"help_page.join_the_community_description_html\" class=\"extra-margin\"></p></div></div></div></section></div><div class=\"clearfix\"></div></div>");
$templateCache.put("generated/components/invitation_form/invitable.html","<div class=\"invitation-form__invitable\"><div class=\"media-left\"><user_avatar ng-if=\"match.label.type == \'user\'\" user=\"match.label.user\" size=\"medium\"></user_avatar><div aria-hidden=\"true\" ng-if=\"match.label.type != \'user\'\" class=\"invitation-form__avatar-image\"><img ng-if=\"match.label.image\" alt=\"{{match.label.name}}\" ng-src=\"{{match.label.image}}\"><img ng-if=\"!match.label.image\" alt=\"{{match.label.name}}\" src=\"img/default-user.png\"></div></div><div class=\"invitation-form__invitable-content\"> <div class=\"invitable-name\">{{match.label.name}}</div> <abbr ng-if=\"match.label.subtitle\" class=\"invitable-subtitle\">{{match.label.subtitle}}</abbr></div><div class=\"invitation-form__spacer\"></div></div>");
$templateCache.put("generated/components/invitation_form/invitation_form.html","<div class=\"invitation-form\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"invitation_form.invite_people\" class=\"lmo-h1 modal-title\"></h1></div><div class=\"modal-body\"><label for=\"group-select\" translate=\"invitation_form.group\"></label><select ng-model=\"form.groupId\" ng-required=\"ng-required\" ng-options=\"group.id as group.fullName for group in availableGroups() | orderBy: \'fullName\'\" ng-change=\"restoreRemoteDraft(); fetchShareableInvitation()\" class=\"invitation-form__group-select form-control\" id=\"group-select\"></select><label translate=\"invitation_form.shareable_link\"></label><div class=\"invitation-form__flex\"><input value=\"{{invitationLink()}}\" class=\"invitation-form__shareable-link-field form-control\"><button type=\"button\" clipboard=\"true\" text=\"invitationLink()\" on-copied=\"copied()\" class=\"invitation-form__copy-button lmo-btn--primary\">{{ \'invitation_form.copy_link\' | translate}}</button></div><div translate=\"invitation_form.shareable_link_explanation\" class=\"invitation-form__shareable-link-explanation\"></div><div translate=\"invitation_form.email_explanation\" class=\"invitation-form__email-explanation\"></div><label for=\"email-addresses\" translate=\"invitation_form.email_addresses\"></label><textarea ng-model=\"form.emails\" ng-required=\"ng-required\" msd-elastic=\"true\" rows=\"1\" ng-model-options=\"{debouce: 600}\" ng-change=\"storeDraft()\" placeholder=\"{{ \'invitation_form.email_addresses_placeholder\' | translate }}\" class=\"invitation-form__email-addresses form-control\" id=\"email-addresses\"></textarea><validation_errors subject=\"form\" field=\"emails\" class=\"invitation-form__validation-errors\"></validation_errors><div ng-show=\"noInvitations\" translate=\"invitation_form.messages.no_invitations\" class=\"invitation-form__no-invitations lmo-validation-error\"></div><div ng-show=\"maxInvitations()\" translate=\"invitation_form.messages.max_invitations\" class=\"invitation-form__max-invitations lmo-validation-error\"></div><p ng-if=\"!showCustomMessageField()\"> <span translate=\"invitation_form.add_custom_message\"></span>  <button translate=\"invitation_form.add_custom_message_link\" ng-click=\"addCustomMessage()\" class=\"invitation-form__add-custom-message-link lmo-btn-link--blue\"></button> </p><div ng-if=\"showCustomMessageField()\" class=\"blank\"><label for=\"custom-message\" translate=\"invitation_form.custom_message\"></label><textarea ng-model=\"form.message\" msd-elastic=\"true\" ng-model-options=\"{debounce: 600}\" ng-change=\"storeDraft()\" placeholder=\"{{ \'invitation_form.custom_message_placeholder\' | translate }}\" class=\"lmo-textarea invitation-form__custom-message form-control\" id=\"custom-message\"></textarea></div><p ng-if=\"form.group().isSubgroup()\"> <button translate=\"invitation_form.add_members\" ng-click=\"addMembers()\" class=\"invitation-form__add-members lmo-btn-link--blue\"></button> <span translate=\"invitation_form.from_parent_group\" translate-values=\"{name: form.group().parentName()}\"></span></p></div><div class=\"modal-footer\"><button ng-click=\"submit()\" translate=\"{{submitText()}}\" translate-value-count=\"{{invitationsCount()}}\" ng-disabled=\"invalidEmail()\" class=\"invitation-form__submit lmo-btn--submit\"></button><button ng-click=\"$close()\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button></div></div>");
$templateCache.put("generated/components/legacy_trial_expired_modal/legacy_trial_expired_modal.html","<div class=\"legacy-trial-expired-modal\"><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"legacy_trial_expired_modal.heading\" class=\"lmo-h1 modal-title\"></h1></div><div class=\"modal-body donation-modal__body\"><img src=\"/img/team-600.png\" alt=\"Loomio team photo\" class=\"donation-modal__loomio-team\"><p translate=\"legacy_trial_expired_modal.body\" class=\"donation-modal__message\"></p></div><div class=\"modal-footer lmo-clearfix\"><button type=\"button\" ng-click=\"submit()\" translate=\"legacy_trial_expired_modal.submit\" class=\"lmo-btn--primary legacy-trial-expired-modal__submit\"></button></div></div>");
$templateCache.put("generated/components/leave_group_form/leave_group_form.html","<form ng-submit=\"submit()\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><div class=\"leave-group-form\"><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"group_page.leave_group.title\" class=\"lmo-h1\"></h1></div><div class=\"modal-body\"><span ng-if=\"canLeaveGroup()\" translate=\"group_page.leave_group.question\"></span><span ng-if=\"!canLeaveGroup()\" translate=\"group_page.leave_group.cannot_leave_group\"></span></div><div class=\"modal-footer\"><button ng-if=\"canLeaveGroup()\" type=\"submit\" translate=\"group_page.leave_group.submit\" class=\"lmo-btn--submit leave-group-form__submit\"></button><a ng-if=\"!canLeaveGroup()\" lmo-href-for=\"group\" lmo-href-action=\"memberships\" ng-click=\"$close()\" class=\"lmo-btn--primary leave-group-form__add-coordinator\"><span translate=\"group_page.leave_group.add_coordinator\"></span></a><button ng-click=\"$close()\" type=\"button\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button></div></div></form>");
$templateCache.put("generated/components/inbox_page/inbox_page.html","<div class=\"lmo-one-column-layout\"><main class=\"inbox-page\"><div class=\"thread-preview-collection__container\"><h1 translate=\"inbox_page.unread_threads\" class=\"lmo-h1-medium inbox-page__heading\"></h1><loading ng-if=\"inboxPage.loading()\"></loading><div ng-if=\"!inboxPage.loading()\" class=\"inbox-page__threads\"><div ng-show=\"!inboxPage.hasThreads()\" class=\"inbox-page__no-threads\"> <span translate=\"inbox_page.no_threads\"></span> </div><div ng-repeat=\"group in inboxPage.groups() | orderBy: \'name\' track by group.id\" class=\"inbox-page__group\"><section ng-if=\"inboxPage.views.groups[group.key].any()\" role=\"region\" aria-label=\"{{ \'inbox_page.threads_from.group\' | translate }} {{group.name}}\"><div class=\"inbox-page__group-name-container\"> <img ng-src=\"{{group.logoUrl()}}\" aria-hidden=\"true\" class=\"selector-list-item-group-logo pull-left\"> <h2 class=\"inbox-page__group-name\"><a href=\"/g/{{group.key}}\">{{group.name}}</a></h2></div><div class=\"inbox-page__groups thread-previews-container\"><thread_preview_collection query=\"inboxPage.views.groups[group.key]\" limit=\"inboxPage.threadLimit\"></thread_preview_collection></div></section></div></div></div></main></div>");
$templateCache.put("generated/components/loading/loading.html","<div class=\"page-loading\"><i class=\"fa fa-lg fa-spin fa-circle-o-notch\"></i></div>");
$templateCache.put("generated/components/membership_requests_page/membership_requests_page.html","<div class=\"loading-wrapper lmo-one-column-layout\"><loading ng-if=\"!membershipRequestsPage.group\"></loading><main ng-if=\"membershipRequestsPage.group\" class=\"membership-requests-page\"><group_theme group=\"membershipRequestsPage.group\"></group_theme><div class=\"membership-requests-page__pending-requests\"><h2 translate=\"membership_requests_page.heading\" class=\"lmo-h2\"></h2><ul ng-if=\"membershipRequestsPage.group.hasPendingMembershipRequests()\"><li ng-repeat=\"request in membershipRequestsPage.pendingRequests() track by request.id\" class=\"media membership-requests-page__pending-request\"><div class=\"media-left\"><user_avatar user=\"request.actor()\" size=\"medium\"></user_avatar></div><div class=\"media-body\"><span class=\"membership-requests-page__pending-request-name\"><strong>{{request.actor().name}}</strong></span><div class=\"membership-requests-page__pending-request-email\">{{request.email}}</div><div class=\"membership-requests-page__pending-request-date\"><timeago timestamp=\"request.createdAt\"></timeago></div><div class=\"membership-requests-page__pending-request-introduction\">{{request.introduction}}</div><div class=\"membership-requests-page__actions\"><button ng-click=\"membershipRequestsPage.approve(request)\" translate=\"membership_requests_page.approve\" class=\"lmo-btn--primary membership-requests-page__approve\"></button><button ng-click=\"membershipRequestsPage.ignore(request)\" translate=\"membership_requests_page.ignore\" class=\"lmo-btn--default membership-requests-page__ignore\"></button></div></div></li></ul><div ng-if=\"!membershipRequestsPage.group.hasPendingMembershipRequests()\" translate=\"membership_requests_page.no_pending_requests\" class=\"membership-requests-page__no-pending-requests\"></div></div><div class=\"membership-requests-page__previous-requests\"><h3 translate=\"membership_requests_page.previous_requests\" class=\"lmo-card-heading\"></h3><ul ng-if=\"membershipRequestsPage.group.hasPreviousMembershipRequests()\"><li ng-repeat=\"request in membershipRequestsPage.previousRequests() track by request.id\" class=\"media membership-requests-page__previous-request\"><div class=\"media-left\"><user_avatar user=\"request.actor()\" size=\"medium\"></user_avatar></div><div class=\"media-body\"><span class=\"membership-requests-page__previous-request-name\"><strong>{{request.actor().name}}</strong></span><div class=\"membership-requests-page__previous-request-email\">{{request.email}}</div><div class=\"membership-requests-page__previous-request-response\"><span translate=\"membership_requests_page.previous_request_response\" translate-value-response=\"{{request.formattedResponse()}}\" translate-value-responder=\"{{request.responder().name}}\"></span><timeago timestamp=\"request.respondedAt\"></timeago></div><div class=\"membership-requests-page__previous-request-introduction\">{{request.introduction}}</div></div></li></ul><div ng-if=\"!membershipRequestsPage.group.hasPreviousMembershipRequests()\" translate=\"membership_requests_page.no_previous_requests\" class=\"membership-requests-page__no-previous-requests\"></div></div></main></div>");
$templateCache.put("generated/components/memberships_page/memberships_page.html","<div class=\"loading-wrapper lmo-one-column-layout\"><loading ng-if=\"!membershipsPage.group\"></loading><main ng-if=\"membershipsPage.group\" class=\"memberships-page\"><group_theme group=\"membershipsPage.group\"></group_theme><div class=\"memberships-page__memberships\"><h2 translate=\"memberships_page.members\" class=\"lmo-h2\"></h2><div class=\"memberships-page__search-filter\"><input ng-model=\"membershipsPage.fragment\" ng-model-options=\"{debounce: 300}\" ng-change=\"membershipsPage.fetchMemberships()\" placeholder=\"{{\'memberships_page.fragment_placeholder\' | translate}}\" class=\"membership-page__search-filter form-control\"><i class=\"fa fa-lg fa-search\"></i></div><admin_memberships_panel ng-if=\"membershipsPage.canAdministerGroup()\" memberships=\"membershipsPage.memberships\" group=\"membershipsPage.group\"></admin_memberships_panel><memberships_panel ng-if=\"!membershipsPage.canAdministerGroup()\" memberships=\"membershipsPage.memberships\" group=\"membershipsPage.group\"></memberships_panel></div><pending_invitations_card group=\"membershipsPage.group\"></pending_invitations_card></main></div>");
$templateCache.put("generated/components/modal_header_cancel_button/modal_header_cancel_button.html","<button type=\"button\" class=\"close\" ng-click=\"$close()\" aria-hidden=\"true\"><span>&times;</span><span translate=\"common.action.cancel\" class=\"sr-only\"></span></button>");
$templateCache.put("generated/components/notifications/comment_liked.html","<div class=\"media-left\"><user_avatar user=\"notification.actor()\" size=\"small\"></user_avatar></div><div class=\"media-body\"><span translate=\"notifications.comment_liked\" translate-value-name=\"{{notification.actor().name}}\" translate-value-discussion=\"{{notification.event().discussion().title}}\"></span> <timeago timestamp=\"notification.createdAt\"></timeago> </div>");
$templateCache.put("generated/components/notifications/comment_replied_to.html","<div class=\"media-left\"><user_avatar user=\"notification.actor()\" size=\"small\"></user_avatar></div><div class=\"media-body\"><span translate=\"notifications.comment_replied_to\" translate-value-name=\"{{notification.actor().name}}\" translate-value-discussion=\"{{notification.event().discussion().title}}\"></span> <timeago timestamp=\"notification.createdAt\"></timeago> </div>");
$templateCache.put("generated/components/notifications/invitation_accepted.html","<div class=\"media-left\"><user_avatar user=\"notification.actor()\" size=\"small\"></user_avatar></div><div class=\"media-body\"><span translate=\"notifications.invitation_accepted\" translate-value-name=\"{{notification.actor().name}}\" translate-value-group=\"{{notification.group().name}}\"></span> <timeago timestamp=\"notification.createdAt\"></timeago> </div>");
$templateCache.put("generated/components/notifications/membership_request_approved.html","<div class=\"media-left\"><user_avatar user=\"notification.actor()\" size=\"small\"></user_avatar></div><div class=\"media-body\"><span translate=\"notifications.membership_request_approved\" translate-value-name=\"{{notification.actor().name}}\" translate-value-group=\"{{notification.event().membership().group().fullName}}\"></span> <timeago timestamp=\"notification.createdAt\"></timeago> </div>");
$templateCache.put("generated/components/notifications/membership_requested.html","<div ng-if=\"notification.event().membershipRequest().byExistingUser()\" class=\"media\"><div class=\"media-left\"><user_avatar user=\"notification.event().membershipRequest().actor()\" size=\"small\"></user_avatar></div><div class=\"media-body\"><span translate=\"notifications.membership_requested\" translate-value-name=\"{{notification.event().membershipRequest().actor().name}}\" translate-value-group=\"{{notification.event().membershipRequest().group().fullName}}\"></span></div></div><div ng-if=\"!notification.event().membershipRequest().byExistingUser()\" class=\"media\"><div class=\"media-left\"><img ng-src=\"{{notification.event().membershipRequest().group().logoUrl()}}\" aria-hidden=\"true\" class=\"lmo-box--small lmo-rounded-corners\"></div><div class=\"media-body\"><span translate=\"notifications.membership_requested\" translate-value-name=\"{{notification.event().membershipRequest().name}}\" translate-value-group=\"{{notification.event().membershipRequest().group().fullName}}\"></span> <timeago timestamp=\"notification.createdAt\"></timeago> </div></div>");
$templateCache.put("generated/components/notifications/motion_closed.html","<div class=\"media-left\"><user_avatar user=\"notification.actor()\" size=\"small\"></user_avatar></div><div class=\"media-body\"><span translate=\"notifications.motion_closed\" translate-value-proposal=\"{{notification.relevantRecord().name}}\"></span> <timeago timestamp=\"notification.createdAt\"></timeago> <div translate=\"notifications.publish_outcome\" class=\"notifications__publish-outcome\"></div></div>");
$templateCache.put("generated/components/notifications/motion_closing_soon.html","<div class=\"media-left\"><div class=\"thread-item__proposal-icon\"></div></div><div class=\"media-body\"><span translate=\"notifications.motion_closing_soon\" translate-value-proposal=\"{{notification.relevantRecord().name}}\"></span> <timeago timestamp=\"notification.createdAt\"></timeago> </div>");
$templateCache.put("generated/components/notifications/motion_outcome_created.html","<div class=\"media-left\"><user_avatar user=\"notification.actor()\" size=\"small\"></user_avatar></div><div class=\"media-body\"><span translate=\"notifications.motion_outcome_created\" translate-value-name=\"{{notification.actor().name}}\" translate-value-proposal=\"{{notification.relevantRecord().name}}\"></span> <timeago timestamp=\"notification.createdAt\"></timeago> </div>");
$templateCache.put("generated/components/notifications/new_coordinator.html","<div class=\"media-left\"><user_avatar user=\"notification.actor()\" size=\"small\"></user_avatar></div><div class=\"media-body\"><span><strong><a lmo-href-for=\"notification.actor()\" class=\"notifications__link\">{{notification.actor().name}}</a></strong></span><span translate=\"notifications.new_coordinator\"></span><span><strong><a lmo-href-for=\"notification.group()\" class=\"notifications__link\">{{notification.group().name}}</a></strong></span> <timeago timestamp=\"notification.createdAt\"></timeago> </div>");
$templateCache.put("generated/components/notifications/notifications.html","<div uib-dropdown=\"true\" on-toggle=\"toggled(open)\" class=\"blank\"><button uib-dropdown-toggle=\"true\" tabindex=\"4\" class=\"lmo-btn--nude lmo-navbar__btn lmo-navbar__btn--notifications lmo-navbar__btn-icon notifications__button has-badge\"><div translate=\"navbar.notifications\" class=\"sr-only\"></div><i aria-hidden=\"true\" ng-class=\"{\'fa-bell\': hasUnread(), \'fa-bell-o\': !hasUnread()}\" class=\"fa fa-lg fa-fw\"></i><span ng-if=\"hasUnread()\" class=\"badge notifications__activity\">{{unreadCount()}}</span></button><div role=\"menu\" class=\"uib-dropdown-menu lmo-dropdown-menu lmo-dropdown-menu--with-selector-list notifications__dropdown\"><div class=\"navbar-notifications\"><ul class=\"selector-list\"><li translate=\"notifications.header\" role=\"heading\" class=\"selector-list-header\"></li><li ng-class=\"{\'lmo-active\': !notification.viewed}\" ng-repeat=\"notification in notifications() | orderBy: \'-createdAt\' track by notification.id\" class=\"selector-list-item media\"><a class=\"selector-list-item-link navbar-notifications__{{notification.kind()}}\" lmo-href-for=\"notification.relevantRecord()\" lmo-href-action=\"{{notification.actionPath()}}\" ng-click=\"broadcastThreadEvent(notification)\"><div ng-include=\"\'generated/components/notifications/\' + notification.kind() + \'.html\'\" class=\"blank\"></div></a></li></ul><loading ng-if=\"loading()\"></loading></div></div></div>");
$templateCache.put("generated/components/notifications/user_added_to_group.html","<span ng-if=\"notification.event().membership().inviter() == null\"><span translate=\"notifications.user_added_to_group_no_inviter\" translate-value-group=\"{{notification.event().membership().group().fullName}}\"></span></span><div ng-if=\"notification.event().membership().inviter()\" class=\"lmo-wrap\"><div class=\"media-left\"><user_avatar user=\"notification.event().membership().inviter()\" size=\"small\"></user_avatar></div><div class=\"media-body\"><span translate=\"notifications.user_added_to_group\" translate-value-name=\"{{notification.event().membership().inviter().name}}\" translate-value-group=\"{{notification.event().membership().group().fullName}}\"></span> <timeago timestamp=\"notification.createdAt\"></timeago> </div></div>");
$templateCache.put("generated/components/notifications/user_mentioned.html","<div class=\"media-left\"><user_avatar user=\"notification.actor()\" size=\"small\"></user_avatar></div><div class=\"media-body\"><span translate=\"notifications.user_mentioned\" translate-value-name=\"{{notification.actor().name}}\" translate-value-title=\"{{notification.event().comment().discussion().title}}\"></span> <timeago timestamp=\"notification.createdAt\"></timeago> </div>");
$templateCache.put("generated/components/pie_with_position/pie_with_position.html","<div class=\"pie-with-position\"><pie_chart votes=\"proposal.voteCounts\" class=\"pie-with-position__pie-canvas\"></pie_chart><div class=\"pie-with-position__position-icon-container\"><div ng-if=\"lastVoteByCurrentUser(proposal)\" class=\"pie-with-position__position-icon thread-preview__position-icon--{{lastVoteByCurrentUser(proposal).position}}\"></div><div ng-if=\"!lastVoteByCurrentUser(proposal)\" class=\"pie-with-position__undecided-icon\"><i class=\"fa fa-question\"></i></div></div></div>");
$templateCache.put("generated/components/previous_proposals_page/previous_proposals_page.html","<div class=\"loading-wrapper lmo-one-column-layout\"><loading ng-if=\"!previousProposalsPage.group\"></loading><main ng-if=\"previousProposalsPage.group\" class=\"previous-proposals-page\"><group_theme group=\"previousProposalsPage.group\"></group_theme><div class=\"previous-proposals-page__previous-proposals\"><div class=\"lmo-card-left-right-padding\"><h2 translate=\"previous_proposals_page.heading\" class=\"lmo-h2\"></h2></div><proposal_accordian ng-if=\"previousProposalsPage.group\" model=\"previousProposalsPage.group\"></proposal_accordian></div></main></div>");
$templateCache.put("generated/components/proposal_closing_time/proposal_closing_time.html"," <abbr class=\"closing-in timeago timeago--inline\"><span ng-if=\"proposal.isActive()\" translate=\"common.closing_in\" translate-value-time=\"{{proposal.closingAt | timeFromNowInWords}}\" ng-attr-title=\"{{proposal.closingAt | exactDateWithTime}}\"></span><span ng-if=\"!proposal.isActive()\" translate=\"common.closed_ago\" translate-value-time=\"{{proposal.closedAt | timeFromNowInWords}}\" ng-attr-title=\"{{proposal.closedAt | exactDateWithTime}}\"></span></abbr> ");
$templateCache.put("generated/components/proposal_form/closing_at_field.html","<div class=\"closing-at-field\"><div class=\"not-a-form-group\"><label for=\"proposal-close-date-field\" translate=\"proposal_form.closes\"></label> <timeago timestamp=\"proposal.closingAt\"></timeago> <div class=\"closing-at-group\"><input type=\"date\" min=\"{{dateToday}}\" ng-model=\"closingDate\" class=\"closing-at-field__date\" id=\"proposal-close-date-field\"><select ng-model=\"closingHour\" class=\"closing-at-field__time\"><option ng-repeat=\"hour in hours\" value=\"{{hour}}\" ng-selected=\"hour == closingHour\">{{ times[hour] }}</option></select><span class=\"closing-at-field__zone\">{{ timeZone }}</span></div></div></div>");
$templateCache.put("generated/components/proposal_form/proposal_form.html","<form ng-submit=\"submit()\" ng-disabled=\"proposal.processing\" class=\"proposal-form\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 ng-if=\"proposal.isNew()\" translate=\"proposal_form.start_a_proposal\" class=\"lmo-h1\"></h1><h1 ng-if=\"!proposal.isNew()\" translate=\"proposal_form.edit_proposal\" class=\"lmo-h1\"></h1></div><div class=\"modal-body\"><p ng-if=\"proposal.isNew()\" translate=\"proposal_form.what_does_a_proposal_do\"></p><p ng-if=\"!proposal.isNew()\" translate=\"proposal_form.editing_title_and_description_forbidden\"></p><form_errors record=\"proposal\"></form_errors><fieldset ng-disabled=\"!proposal.canBeEdited()\"><div class=\"lmo-form-group\"><label for=\"proposal-title-field\" translate=\"proposal_form.title_label\"></label><div class=\"lmo-relative\"><textarea msd-elastic=\"true\" rows=\"1\" placeholder=\"{{ \'proposal_form.title_placeholder\' | translate }}\" ng-model=\"proposal.name\" ng-model-options=\"{debounce: 600}\" ng-change=\"storeDraft()\" ng-required=\"false\" maxlength=\"255\" class=\"proposal-form__title-field form-control lmo-primary-form-input\" id=\"proposal-title-field\"></textarea></div><validation_errors subject=\"proposal\" field=\"name\"></validation_errors></div><div class=\"lmo-form-group\"><label for=\"proposal-details-field\" translate=\"proposal_form.details_label\"></label><div class=\"lmo-relative\"><textarea msd-elastic=\"true\" ng-model=\"proposal.description\" ng-model-options=\"{debounce: 600}\" ng-change=\"storeDraft()\" placeholder=\"{{ \'proposal_form.details_placeholder\' | translate }}\" class=\"lmo-textarea proposal-form__details-field form-control lmo-primary-form-input\" id=\"proposal-details-field\"></textarea><emoji_picker target-selector=\"descriptionSelector\" class=\"lmo-action-dock\"></emoji_picker></div></div><closing_at_field proposal=\"proposal\"></closing_at_field></fieldset></div><div class=\"modal-footer\"><button ng-if=\"proposal.isNew()\" type=\"submit\" translate=\"proposal_form.start_proposal\" class=\"lmo-btn--submit proposal-form__start-btn\"></button><button ng-if=\"!proposal.isNew()\" type=\"submit\" translate=\"common.action.save_changes\" class=\"lmo-btn--submit proposal-form__save-changes-btn\"></button><button ng-click=\"$close($event)\" type=\"button\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel proposal-form__cancel-btn\"></button></div></form>");
$templateCache.put("generated/components/profile_page/profile_page.html","<div class=\"loading-wrapper lmo-one-column-layout\"><loading ng-if=\"!profilePage.user\"></loading><main ng-if=\"profilePage.user\" class=\"profile-page\"><h1 translate=\"profile_page.profile\" class=\"lmo-h1 lmo-vertical-spacer-lg\"></h1><div class=\"profile-page-card\"><div ng-show=\"profilePage.isDisabled\" class=\"lmo-disabled-form\"></div><h3 translate=\"profile_page.edit_profile\" class=\"lmo-h3\"></h3><label for=\"user-picture-field\" translate=\"profile_page.picture_label\"></label><user_avatar user=\"profilePage.user\" size=\"featured\"></user_avatar><div class=\"lmo-vertical-spacer\"><button ng-click=\"profilePage.changePicture()\" translate=\"profile_page.change_picture_link\" class=\"profile-page__change-picture lmo-link\"></button></div><div class=\"profile-page__profile-fieldset lmo-vertical-spacer\"><label for=\"user-name-field\" translate=\"profile_page.name_label\"></label><input ng-required=\"ng-required\" ng-model=\"profilePage.user.name\" class=\"profile-page__name-input form-control\" id=\"user-name-field\"><validation_errors subject=\"profilePage.user\" field=\"name\"></validation_errors><label for=\"user-username-field\" translate=\"profile_page.username_label\"></label><input ng-required=\"ng-required\" ng-model=\"profilePage.user.username\" class=\"profile-page__username-input form-control\" id=\"user-username-field\"><validation_errors subject=\"profilePage.user\" field=\"username\"></validation_errors><label for=\"user-email-field\" translate=\"profile_page.email_label\"></label><input ng-required=\"ng-required\" ng-model=\"profilePage.user.email\" class=\"profile-page__email-input form-control\" id=\"user-email-field\"><validation_errors subject=\"profilePage.user\" field=\"email\"></validation_errors><label for=\"user-locale-field\" translate=\"profile_page.locale_label\"></label><select ng-model=\"profilePage.user.selectedLocale\" ng-required=\"true\" ng-options=\"locale.key as locale.name for locale in profilePage.availableLocales()\" class=\"profile-page__language-input form-control\" id=\"user-locale-field\"></select><validation_errors subject=\"profilePage.user\" field=\"selectedLocale\"></validation_errors></div><div class=\"profile-page__update-account lmo-vertical-spacer\"><button ng-click=\"profilePage.submit()\" ng-disabled=\"isDisabled\" translate=\"profile_page.update_profile\" class=\"lmo-btn--submit profile-page__update-button\"></button></div><div class=\"lmo-vertical-spacer\"><button ng-click=\"profilePage.changePassword()\" translate=\"profile_page.change_password_link\" class=\"profile-page__change-password lmo-link\"></button></div></div><div ng-if=\"profilePage.canDeactivateUser()\" class=\"profile-page-card\"><h3 translate=\"profile_page.deactivate_user.title\" class=\"lmo-h3\"></h3><button ng-click=\"profilePage.deactivateUser()\" translate=\"profile_page.deactivate_user_link\" class=\"lmo-link lmo-vertical-spacer\"></button></div></main></div>");
$templateCache.put("generated/components/proposal_redirect/proposal_redirect.html","<div class=\"lmo-one-column-layout\">redirecting to thread</div>");
$templateCache.put("generated/components/registered_app_form/registered_app_form.html","<form name=\"registeredAppForm\" ng_submit=\"submit()\" ng-disabled=\"isDisabled\" class=\"registered-app-form\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"registered_app_form.new_application_title\" ng-show=\"application.isNew()\" class=\"lmo-h1 modal-title\"></h1><h1 translate=\"registered_app_form.edit_application_title\" ng-hide=\"application.isNew()\" class=\"lmo-h1 modal-title\"></h1></div><div class=\"modal-body registered-app-form__modal-body\"><div class=\"lmo-form-group registered-app-form__avatar\"><img ng-src=\"{{application.logoUrl}}\"> <button ng-if=\"!application.isNew()\" type=\"button\" ng-click=\"clickFileUpload()\" class=\"lmo-btn--cancel registered-app-form__logo-upload-button\"> <i class=\"fa fa-lg fa-camera\"></i>  <span translate=\"common.action.upload\"></span> </button> <input type=\"file\" ng-model=\"file\" ng-file-select=\"upload(file)\" class=\"registered-app-form__logo-input hidden\"></div><div class=\"lmo-form-group registered-app-form__text-fields\"><label for=\"application-name\" translate=\"registered_app_form.name_label\"></label><input placeholder=\"{{ \'registered_app_form.name_placeholder\' | translate }}\" ng-model=\"application.name\" ng-required=\"true\" maxlength=\"255\" class=\"registered-app-form__name-input form-control lmo-primary-form-input\"><validation_errors subject=\"application\" field=\"name\"></validation_errors><label for=\"application-redirect-uri\" translate=\"registered_app_form.redirect_uri_label\"></label><textarea msd-elastic=\"true\" ng-model=\"application.redirectUri\" ng-required=\"true\" placeholder=\"{{ \'registered_app_form.redirect_uri_placeholder\' | translate }}\" class=\"lmo-textarea registered-app-form__redirect-uris-input form-control\"></textarea><abbr translate=\"registered_app_form.redirect_uri_note\" class=\"registered-app-form__helptext\"></abbr><validation_errors subject=\"application\" field=\"redirectUri\"></validation_errors></div><div class=\"clearfix\"></div></div><div class=\"modal-footer\"><button type=\"submit\" translate=\"registered_app_form.new_application_submit\" ng-show=\"application.isNew()\" class=\"lmo-btn--submit registered-app-form__submit\"></button><button type=\"submit\" translate=\"registered_app_form.edit_application_submit\" ng-hide=\"application.isNew()\" class=\"lmo-btn--primary registered-app-form__update\"></button><button type=\"button\" ng-click=\"$close()\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel registered-app-form__cancel\"></button></div></form>");
$templateCache.put("generated/components/registered_app_page/registered_app_page.html","<div class=\"lmo-one-column-layout\"><loading ng-if=\"!registeredAppPage.application\"></loading><main ng-if=\"registeredAppPage.application\" class=\"registered-app-page\"><img ng-src=\"{{registeredAppPage.application.logoUrl}}\" class=\"registered-app-page__avatar\"><h1 class=\"lmo-h1 registered-app-page__title\">{{ registeredAppPage.application.name }}</h1><hr><h3 translate=\"registered_app_page.uid\" class=\"lmo-h3 registered-app-page__header\"></h3><div class=\"registered-app-page__flex\"><code class=\"registered-app-page__code\">{{ registeredAppPage.application.uid }}</code><button type=\"button\" title=\"{{ \'common.copy\' | translate }}\" clipboard=\"true\" text=\"registeredAppPage.application.uid\" on-copied=\"registeredAppPage.copied()\" class=\"lmo-btn--nude registered-app-page__btn--copy\"> <i class=\"fa fa-copy\"></i> </button></div><h3 translate=\"registered_app_page.secret\" class=\"lmo-h3 registered-app-page__header\"></h3><div class=\"registered-app-page__flex\"><code class=\"registered-app-page__code\">{{ registeredAppPage.application.secret }}</code><button type=\"button\" title=\"{{ \'common.copy\' | translate }}\" clipboard=\"true\" text=\"registeredAppPage.application.secret\" on-copied=\"registeredAppPage.copied()\" class=\"lmo-btn--nude registered-app-page__btn--copy\"> <i class=\"fa fa-copy\"></i> </button></div><h3 translate=\"registered_apps_page.redirect_uris\" class=\"lmo-h3 registered-app-page__header\"></h3><div ng-repeat=\"uri in registeredAppPage.application.redirectUriArray()\" class=\"registered-app-page__flex\"><code class=\"registered-app-page__code\">{{ uri }}</code><button type=\"button\" title=\"{{ \'common.copy\' | translate }}\" clipboard=\"true\" text=\"uri\" on-copied=\"registeredAppPage.copied()\" class=\"lmo-btn--nude registered-app-page__btn--copy\"> <i class=\"fa fa-copy\"></i> </button></div><hr><a lmo-href=\"/apps/registered\" class=\"lmo-btn--cancel pull-left\"><span translate=\"common.action.back\"></span></a> <button type=\"button\" translate=\"common.action.remove\" ng-click=\"registeredAppPage.openRemoveForm()\" class=\"lmo-btn--danger pull-right\"></button>  <button type=\"button\" translate=\"common.action.edit\" ng-click=\"registeredAppPage.openEditForm()\" class=\"lmo-btn--primary pull-right registered-app-page__edit\"></button> <div class=\"clearfix\"></div></main></div>");
$templateCache.put("generated/components/proposal_accordian/proposal_accordian.html","<div class=\"proposal-accordian\"><div ng-repeat=\"proposal in model.closedProposals() | orderBy:\'-closedAt\' track by proposal.id\" id=\"proposal-{{proposal.id}}\" class=\"lmo-wrap\"><div ng-if=\"selectedProposalId == proposal.id\" class=\"active-proposal\"><proposal_expanded proposal=\"proposal\" can_collapse=\"true\"></proposal_expanded></div><div ng-if=\"selectedProposalId != proposal.id\" ng-click=\"selectProposal(proposal)\" class=\"inactive-proposal\"><proposal_collapsed proposal=\"proposal\"></proposal_collapsed></div></div></div>");
$templateCache.put("generated/components/registered_apps_page/registered_apps_page.html","<div class=\"lmo-one-column-layout\"><loading ng-show=\"registeredAppsPage.loading\"></loading><main ng-if=\"!registeredAppsPage.loading\" class=\"registered-apps-page\"><h1 translate=\"registered_apps_page.title\" class=\"lmo-h1\"></h1><hr><div ng-if=\"registeredAppsPage.applications().length == 0\" translate=\"registered_apps_page.no_applications\" class=\"lmo-placeholder\"></div><div ng-if=\"registeredAppsPage.applications().length &gt; 0\" class=\"registered-apps-page__table\"><div class=\"row registered-apps-page__table-row\"><div class=\"col-xs-1\"></div><div translate=\"registered_apps_page.name\" class=\"lmo-bold col-xs-3\"></div><div translate=\"registered_apps_page.redirect_uris\" class=\"lmo-bold col-xs-7\"></div><div class=\"lmo-bold col-xs-1\"></div></div><div ng-repeat=\"application in registeredAppsPage.applications() | orderBy: \'name\' track by application.id\" class=\"row registered-apps-page__table-row\"><div class=\"col-xs-1 align-right\"> <img ng-src=\"{{application.logoUrl}}\" class=\"registered-apps-page__avatar\"> </div><div class=\"col-xs-3\"><a lmo-href-for=\"application\" class=\"registered-apps-page__name\">{{ application.name }}</a></div><div class=\"col-xs-7\"><code ng-repeat=\"uri in application.redirectUriArray()\" class=\"registered-apps-page__code\">{{uri}}</code></div><div class=\"col-xs-1 align-center\"><button ng-click=\"registeredAppsPage.openDestroyForm(application)\" class=\"registered-apps-page__remove-link\"><i class=\"fa fa-lg fa-times-circle\"></i></button></div><div class=\"clearfix\"></div></div></div><hr><button ng-click=\"registeredAppsPage.openApplicationForm()\" class=\"lmo-btn lmo-btn--submit\"><span translate=\"registered_apps_page.create_new_application\"></span></button></main></div>");
$templateCache.put("generated/components/remove_app_form/remove_app_form.html","<form ng-submit=\"submit()\"><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"remove_app_form.title\" translate-value-name=\"{{application.name}}\" class=\"lmo-h1\"></h1></div><div class=\"modal-body\"><span translate=\"remove_app_form.question\" translate-value-name=\"{{application.name}}\"></span></div><div class=\"modal-footer\"><button type=\"submit\" translate=\"remove_app_form.submit\" class=\"lmo-btn--danger\"></button><button ng-click=\"$close()\" type=\"button\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button></div></form>");
$templateCache.put("generated/components/revoke_app_form/revoke_app_form.html","<form ng-submit=\"submit()\"><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"revoke_app_form.title\" translate-value-name=\"{{application.name}}\" class=\"lmo-h1\"></h1></div><div class=\"modal-body\"><span translate=\"revoke_app_form.question\" translate-value-name=\"{{application.name}}\"></span></div><div class=\"modal-footer\"><button type=\"submit\" translate=\"revoke_app_form.submit\" class=\"lmo-btn--danger\"></button><button ng-click=\"$close()\" type=\"button\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button></div></form>");
$templateCache.put("generated/components/remove_membership_form/remove_membership_form.html","<form ng-submit=\"submit()\"><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"memberships_page.remove_membership.title\" class=\"lmo-h1\"></h1></div><div class=\"modal-body\"><span translate=\"memberships_page.remove_membership.question\" translate-value-name=\"{{membership.userName()}}\" translate-value-group=\"{{membership.group().name}}\"></span></div><div class=\"modal-footer\"><button type=\"submit\" translate=\"memberships_page.remove_membership.submit\" class=\"lmo-btn--danger memberships-page__remove-membership-confirm\"></button><button ng-click=\"$close()\" type=\"button\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button></div></form>");
$templateCache.put("generated/components/smart_time/smart_time.html"," <abbr class=\"smart-time\"><span data-toggle=\"tooltip\" ng-attr-title=\"{{time | exactDateWithTime}}\">{{value}}</span></abbr> ");
$templateCache.put("generated/components/star_toggle/star_toggle.html","<div ng-if=\"isLoggedIn()\" class=\"star-toggle\"><input type=\"checkbox\" id=\"star-thread-{{thread.id}}\" ng-change=\"thread.saveStar()\" ng-model=\"thread.starred\" class=\"sr-only\"><label for=\"star-thread-{{thread.id}}\" class=\"fa\"><span translate=\"star_toggle.star\" class=\"sr-only\"></span></label></div>");
$templateCache.put("generated/components/start_group_form/start_group_form.html","<form name=\"startGroupForm\" ng_submit=\"submit()\" ng-disabled=\"group.processing\" class=\"start-group-form\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 ng-if=\"group.isParent()\" translate=\"start_group_form.heading\" class=\"lmo-h1 modal-title\"></h1><h1 ng-if=\"group.isSubgroup()\" translate=\"start_group_form.heading_when_subgroup\" class=\"lmo-h1 modal-title\"></h1></div><div class=\"modal-body\"><form_errors record=\"group\"></form_errors><div ng-if=\"group.isParent()\" translate=\"start_group_form.group_helptext\" class=\"group-helptext\"></div><div class=\"lmo-form-group\"><label for=\"group-name\" ng-if=\"group.isParent()\" translate=\"start_group_form.name_label\"></label><label for=\"group-name\" ng-if=\"group.isSubgroup()\" translate=\"start_group_form.subgroup_name_label\"></label><input ng-model=\"group.name\" ng-model-options=\"{debounce: 600}\" ng-change=\"storeDraft()\" ng-required=\"true\" class=\"start-group-form__name lmo-primary-form-input form-control\" id=\"group-name\"></div><div class=\"lmo-form-group\"><label for=\"group-description\" translate=\"start_group_form.description_label\"></label><textarea msd-elastic=\"true\" ng-model=\"group.description\" ng-model-options=\"{debounce: 600}\" ng-change=\"storeDraft()\" placeholder=\"{{ \'start_group_form.description_placeholder\' | translate }}\" class=\"lmo-textarea start-group-form__description lmo-primary-form-input form-control\" id=\"group-description\"></textarea></div><div ng-if=\"group.isParent()\" translate=\"start_group_form.group_payment_reminder\" class=\"group-payment-notice\"></div></div><div class=\"modal-footer\"><button type=\"submit\" translate=\"start_group_form.submit\" class=\"lmo-btn--submit start-group-form__submit\"></button><button type=\"button\" ng-click=\"$close()\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button></div></form>");
$templateCache.put("generated/components/start_menu/start_menu.html","<div class=\"start-menu\"><div ng-show=\"startMenuOpen\" uib-modal-window=\"uib-modal-window\" ng-click=\"toggleStartMenu()\" class=\"start-menu__modal-backdrop modal-backdrop\"></div><div ng-show=\"startMenuOpen\" class=\"start-menu__options start-menu__over-modal\"><start_menu_option text=\"invite_people\" icon=\"user\" action=\"invitePeople\" group=\"currentGroup\" hotkey=\"pressedI\"></start_menu_option><start_menu_option text=\"start_group\" icon=\"group\" action=\"startGroup\" group=\"currentGroup\" hotkey=\"pressedG\"></start_menu_option><start_menu_option text=\"start_thread\" icon=\"pencil\" action=\"startThread\" group=\"currentGroup\" hotkey=\"pressedT\"></start_menu_option></div><button ng-click=\"toggleStartMenu()\" title=\"{{\'start_menu.title\' | translate}}\" class=\"start-menu__start-button start-menu__menu-button start-menu__over-modal\"><i ng-if=\"!startMenuOpen\" class=\"fa fa-plus fa-2x\"></i><i ng-if=\"startMenuOpen\" class=\"fa fa-times fa-2x\"></i></button></div>");
$templateCache.put("generated/components/start_menu/start_menu_option.html","<button class=\"start-menu__option start-menu__{{action}}\" ng-click=\"openModal()\"><div translate=\"start_menu.{{text}}\" class=\"start-menu__option-text\"></div><div class=\"start-menu__option-icon start-menu__menu-button\"><i class=\"fa fa-lg fa-{{icon}}\"></i></div></button>");
$templateCache.put("generated/components/start_proposal_button/start_proposal_button.html","<div ng-show=\"canStartProposal()\" class=\"start-proposal-button\"><button type=\"button\" ng-click=\"startProposal()\" class=\"lmo-btn--featured start-proposal-button__button\"> <i class=\"fa fa-lg fa-rocket\"></i> <span translate=\"proposal_form.start_proposal\"></span></button></div>");
$templateCache.put("generated/components/thread_lintel/thread_lintel.html","<div ng-if=\"show()\" class=\"thread-lintel__wrapper\"><div class=\"thread-lintel__content\"><div ng-class=\"{\'lmo-width-75\': !proposalButtonInView}\" class=\"thread-lintel__left\"><div ng-click=\"scrollToThread()\" class=\"lmo-truncate thread-lintel__title\">{{ discussion.title }}</div><div ng-if=\"discussion.activeProposal() &amp;&amp; !proposalInView\" ng-click=\"scrollToProposal()\" class=\"lmo-truncate thread-lintel__proposal\"><div class=\"thread-lintel__proposal-pie-chart\"><pie_chart votes=\"discussion.activeProposal().voteCounts\" class=\"lmo-box--tiny\"></pie_chart></div><span>{{ discussion.activeProposal().name }}</span></div></div><div ng-if=\"!discussion.activeProposal() &amp;&amp; !proposalButtonInView\" class=\"thread-lintel__right\"><start_proposal_button discussion=\"discussion\" class=\"hidden-xs\"></start_proposal_button></div><div class=\"thread-lintel__progress-wrap thread-lintel__progress\"><div style=\"width: {{positionPercent}}%\" class=\"thread-lintel__progress-bar thread-lintel__progress\"></div></div></div></div>");
$templateCache.put("generated/components/thread_page/thread_page.html","<div class=\"loading-wrapper lmo-two-column-layout\"><loading ng-if=\"!threadPage.discussion\"></loading><main ng-if=\"threadPage.discussion\" class=\"thread-page\"><group_theme group=\"threadPage.discussion.group()\" compact=\"true\"></group_theme><div class=\"lmo-thread-column-left\"><section aria-label=\"{{ \'thread_context.aria_label\' | translate }}\" class=\"thread-context\"><div class=\"thread-actions pull-right\"><star_toggle thread=\"threadPage.discussion\"></star_toggle><span uib-dropdown=\"true\" ng-if=\"threadPage.showContextMenu()\"><button uib-dropdown-toggle=\"true\" class=\"thread-context__dropdown-button lmo-btn--nude\"><div translate=\"thread_context.thread_options\" class=\"sr-only\"></div><i class=\"fa fa-fw fa-chevron-down\"></i></button><div class=\"thread-context__dropdown uib-dropdown-menu lmo-dropdown-menu\"><ul class=\"lmo-dropdown-menu-items\"><li ng-if=\"threadPage.canChangeVolume()\" class=\"lmo-dropdown-menu-item\"><a ng-click=\"threadPage.openChangeVolumeForm()\" translate=\"thread_context.email_settings\" class=\"thread-context__dropdown-options-email-settings lmo-dropdown-menu-item-label\"></a></li><li ng-if=\"threadPage.canEditThread()\" class=\"lmo-dropdown-menu-item\"><a ng-click=\"threadPage.editThread()\" translate=\"thread_context.edit_thread\" class=\"thread-context__dropdown-options-edit lmo-dropdown-menu-item-label\"></a></li><li ng-if=\"threadPage.canMoveThread()\" class=\"lmo-dropdown-menu-item\"><a ng-click=\"threadPage.moveThread()\" translate=\"thread_context.move_thread\" class=\"thread-context__dropdown-options-move lmo-dropdown-menu-item-label\"></a></li><li class=\"lmo-dropdown-menu-item\"><a lmo-href-for=\"threadPage.discussion\" lmo-href-action=\"print\" target=\"_blank\" class=\"thread-context__dropdown-options-print\"><span translate=\"thread_context.print_thread\"></span></a></li><li ng-if=\"threadPage.canDeleteThread()\" class=\"lmo-dropdown-menu-item\"><a ng-click=\"threadPage.deleteThread()\" translate=\"thread_context.delete_thread\" class=\"thread-context__dropdown-options-delete lmo-dropdown-menu-item-label\"></a></li></ul></div></span></div><h1 in-view=\"threadPage.showLintel(!$inview)\" class=\"lmo-h1\" id=\"thread-context__heading\">{{threadPage.discussion.title}}</h1><h1 ng-if=\"threadPage.translation\"><translation translation=\"threadPage.translation\" field=\"title\"></translation></h1><div class=\"thread-context__details\"><span translate=\"discussion.started_by\" translate-value-name=\"{{::threadPage.discussion.authorName()}}\"></span> <timeago timestamp=\"::threadPage.discussion.createdAt\" class=\"nowrap\"></timeago>  <translate_button model=\"threadPage.discussion\" showdot=\"true\" class=\"lmo-card-minor-action\"></translate_button> <span aria-hidden=\"true\">·</span><span ng-if=\"threadPage.discussion.edited()\"> <button ng-click=\"threadPage.showRevisionHistory()\" translate=\"discussion.edited\" class=\"thread-context__edited-link lmo-btn-link\"></button> <span aria-hidden=\"true\">·</span></span> <span ng-show=\"threadPage.discussion.private\" class=\"nowrap discussion-privacy__is-private\"> <i class=\"fa fa-lock\"></i> <span translate=\"common.privacy.private\"></span></span>  <span ng-show=\"!threadPage.discussion.private\" class=\"nowrap discussion-privacy__is-public\"> <i class=\"fa fa-globe\"></i> <span translate=\"common.privacy.public\"></span></span> <outlet name=\"after-thread-title\"></outlet></div><div marked=\"threadPage.discussion.description\" aria-label=\"{{ \'thread_context.aria_label\' | translate }}\" class=\"thread-context__description lmo-markdown-wrapper\"></div><translation ng-if=\"threadPage.translation &amp;&amp; threadPage.discussion.description\" translation=\"threadPage.translation\" field=\"description\"></translation><a ng-click=\"threadPage.editThread()\" translate=\"thread_context.edit_thread\" ng-if=\"threadPage.canEditThread()\" class=\"thread-context__edit-link lmo-card-minor-action\"></a></section></div><div class=\"lmo-thread-column-right\"><section in-view=\"threadPage.proposalButtonInView($inview)\" in-view-options=\"{debounce: 200}\" ng-if=\"threadPage.canStartProposal()\" aria-label=\"{{ \'start_proposal_card.title\' | translate }}\" class=\"start-proposal-card\"><h2 translate=\"common.models.proposal\" class=\"lmo-card-heading\"></h2><div translate=\"start_proposal_card.helptext\" class=\"lmo-placeholder lmo-hint-text table-cell\"></div><div class=\"start-proposal-card__start-proposal-button\"><start_proposal_button discussion=\"threadPage.discussion\" class=\"table-cell thread-start-proposal-button\"></start_proposal_button></div></section><current_proposal_card in-view=\"threadPage.proposalInView($inview)\" in-view-options=\"{debounce: 200}\" ng-if=\"threadPage.discussion.hasActiveProposal()\" proposal=\"threadPage.discussion.activeProposal()\"></current_proposal_card><previous_proposals_card discussion=\"threadPage.discussion\"></previous_proposals_card></div><div class=\"lmo-thread-column-left\"><activity_card discussion=\"threadPage.discussion\" active-comment-id=\"threadPage.activeCommentId\"></activity_card><comment_form discussion=\"threadPage.discussion\"></comment_form><outlet name=\"thread-page-column-right\"></outlet></div><thread_lintel></thread_lintel><div class=\"clearfix\"></div></main></div>");
$templateCache.put("generated/components/thread_preview/thread_preview.html","<div class=\"thread-preview\"><a lmo-href-for=\"thread\" class=\"thread-preview__link\"><div class=\"thread-preview__icon\"><user_avatar ng-if=\"!thread.activeProposal()\" user=\"thread.author()\" size=\"medium\"></user_avatar><div ng-if=\"thread.activeProposal()\" class=\"thread-preview__pie-container\"><pie_chart votes=\"thread.activeProposal().voteCounts\" ng-if=\"thread.activeProposal()\" class=\"thread-preview__pie-canvas\"></pie_chart><div class=\"thread-preview__position-icon-container\"><div ng-if=\"lastVoteByCurrentUser(thread)\" class=\"thread-preview__position-icon thread-preview__position-icon--{{lastVoteByCurrentUser(thread).position}}\"></div><div ng-if=\"!lastVoteByCurrentUser(thread)\" class=\"thread-preview__undecided-icon\"><i class=\"fa fa-question\"></i></div></div></div></div><div class=\"sr-only\"><span>{{thread.authorName()}}: {{thread.title}}.</span><span ng-if=\"thread.isUnread()\" translate=\"dashboard_page.aria_thread.unread\" translate-value-count=\"{{ thread.unreadItemsCount() }}\"></span><span ng-if=\"thread.activeProposal()\" translate=\"dashboard_page.aria_thread.current_proposal\" translate-value-name=\"{{ thread.activeProposal().name }}\"></span><span ng-if=\"thread.activeProposal() &amp;&amp; lastVoteByCurrentUser(thread)\" translate=\"dashboard_page.aria_thread.you_voted\" translate-value-position=\" {{lastVoteByCurrentUser(thread).position}} \"></span></div><div aria-hidden=\"true\" class=\"screen-only\"><div class=\"thread-preview__text-container\"><div ng-class=\"{\'thread-preview--unread\': thread.isUnread() }\" class=\"thread-preview__title\">{{thread.title}}</div><div ng-if=\"thread.isUnread() &amp;&amp; thread.itemsCount &gt; 0\" class=\"thread-preview__unread-count\">({{thread.unreadItemsCount()}})</div></div><div ng-if=\"thread.activeProposal()\" class=\"thread-preview__text-container\"> <div class=\"thread-preview__proposal-name\">{{ thread.activeProposal().name }}</div> <div ng-if=\"thread.activeProposal().closingSoon()\" class=\"thread-preview__proposal-closing-container\"> <proposal_closing_time proposal=\"thread.activeProposal()\" class=\"thread-preview__proposal-closing-at\"></proposal_closing_time> </div></div><div class=\"thread-preview__text-container\"><div class=\"thread-preview__group-name\">{{ thread.group().fullName }} · <smart_time time=\"thread.lastActivityAt\"></smart_time> </div></div><outlet name=\"after-thread-preview\"></outlet></div></a><div class=\"thread-preview__star\"><star_toggle thread=\"thread\" aria-hidden=\"true\"></star_toggle></div><div ng-if=\"thread.discussionReaderId\" class=\"thread-preview__actions hidden-xs\"> <button ng-click=\"thread.markAsRead()\" ng-class=\"{disabled: !thread.isUnread()}\" title=\"{{\'dashboard_page.mark_as_read\' | translate }}\" class=\"thread-preview__mark-as-read\"> <i class=\"fa fa-check\"></i> </button>  <button ng-click=\"changeVolume(\'mute\')\" ng-show=\"!thread.isMuted()\" title=\"{{ \'volume_levels.mute\' | translate }}\" class=\"thread-preview__mute\"><i class=\"fa fa-volume-off\"></i> <i class=\"fa fa-times\"></i> </button>  <button ng-click=\"changeVolume(\'normal\')\" ng-show=\"thread.isMuted()\" title=\"{{ \'volume_levels.unmute\' | translate }}\" class=\"thread-preview__mute\"> <i class=\"fa fa-volume-down\"></i> </button> </div></div>");
$templateCache.put("generated/components/thread_preview_collection/thread_preview_collection.html","<div class=\"thread-previews\"><outlet name=\"before-thread-previews\"></outlet><div ng-repeat=\"thread in query.threads() | orderBy:importance track by thread.key | limitTo: limit\" class=\"blank\"><thread_preview thread=\"thread\"></thread_preview></div></div>");
$templateCache.put("generated/components/timeago/timeago.html"," <abbr class=\"timeago\"><span am-time-ago=\"timestamp\" data-toggle=\"tooltip\" ng-attr-title=\"{{timestamp | exactDateWithTime}}\"></span></abbr> ");
$templateCache.put("generated/components/translate_button/translate_button.html","<div class=\"translate-button\"> <span ng-if=\"showdot &amp;&amp; (canTranslate() || translateExecuting || translated)\" aria-hidden=\"true\">·</span>  <button ng-if=\"canTranslate()\" ng-click=\"translate()\" translate=\"common.action.translate\" class=\"thread-item__translate\"></button> <loading ng-show=\"translateExecuting\" class=\"translate-button__loading\"></loading> <span ng-if=\"translated\" translate=\"common.action.translated\" class=\"thread-item__translation\"></span> </div>");
$templateCache.put("generated/components/translation/translation.html","<div class=\"translation\"><hr><div marked=\"translated\" class=\"translation__body lmo-markdown-wrapper\"></div><hr></div>");
$templateCache.put("generated/components/user_avatar/user_avatar.html","<div class=\"user-avatar lmo-box--{{size}}\" aria-hidden=\"true\" ng-class=\"{\'user-avatar--coordinator\': coordinator}\" title=\"{{user.name}}\"><div class=\"lmo-box--{{size}} user-avatar__initials--{{size}}\" aria-hidden=\"true\" ng-if=\"user.avatarKind == \'initials\'\">{{user.avatarInitials}}</div><img class=\"lmo-box--{{size}}\" ng-if=\"user.avatarKind == \'gravatar\'\" gravatar-src-once=\"user.gravatarMd5\" gravatar-size=\"50\" alt=\"{{::user.name}}\"><img class=\"lmo-box--{{size}}\" ng-if=\"user.avatarKind == \'uploaded\'\" alt=\"{{user.name}}\" ng-src=\"{{::user.avatarUrl}}\"></div>");
$templateCache.put("generated/components/user_page/user_page.html","<div class=\"loading-wrapper container main-container lmo-one-column-layout\"><loading ng-if=\"!userPage.user\"></loading><main ng-if=\"userPage.user\" class=\"user-page main-container lmo-row\"><div class=\"user-page__profile\"><div class=\"user-page__left\"><user_avatar user=\"userPage.user\" size=\"featured\"></user_avatar></div><div class=\"user-page__right\"><h1 class=\"user-page__name\">{{userPage.user.name}}</h1><h4 class=\"user-page__username\">@{{userPage.user.username}}</h4><h2 translate=\"common.groups\" class=\"lmo-h2 user-page__groups-title\"></h2><div ng-repeat=\"group in userPage.user.groups() | orderBy: \'fullName\' track by group.id\" class=\"user-page__groups\"><a lmo-href-for=\"group\">{{group.fullName}}</a></div><loading ng-if=\"userPage.loadGroupsForExecuting\"></loading></div><div class=\"clearfix\"></div></div></main></div>");
$templateCache.put("generated/components/validation_errors/validation_errors.html","<div class=\"lmo-validation-error\"><label for=\"{{field}}-error\" ng-repeat=\"error in subject.errors[field]\"><span>{{error}}</span></label></div>");
$templateCache.put("generated/components/move_thread_form/move_thread_form.html","<form ng-submit=\"submit()\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><div class=\"move-thread-form\"><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"move_thread_form.title\" class=\"lmo-h1\"></h1></div><div class=\"modal-body\"><label for=\"group-dropdown\" translate=\"move_thread_form.body\"></label><select ng-model=\"discussion.groupId\" ng-required=\"ng-required\" ng-options=\"group.id as group.fullName for group in availableGroups() | orderBy: \'fullName\'\" ng-change=\"updateTarget()\" class=\"move-thread-form__group-dropdown form-control\" id=\"group-dropdown\"></select></div><div class=\"modal-footer\"><button type=\"button\" translate=\"move_thread_form.confirm\" ng-click=\"moveThread()\" class=\"lmo-btn--submit move-thread-form__submit\"></button><button ng-click=\"$close()\" type=\"button\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button></div></div></form>");
$templateCache.put("generated/components/mute_explanation_modal/mute_explanation_modal.html","<div class=\"mute-explanation-modal\"><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"mute_explanation_modal.mute_thread\" class=\"lmo-h1 mute-explanation-modal__title\"></h1></div><div class=\"modal-body mute-explanation-modal__body\"><div translate=\"mute_explanation_modal.body\" class=\"mute-explanation-modal__mute-explanation\"></div><div class=\"mute-explanation-modal__muted-threads-image\"><img src=\"/img/muted-threads-cropped.png\" alt=\"Muted threads filter\"></div></div><div class=\"modal-footer lmo-clearfix\"><button type=\"button\" ng-click=\"changeVolume(\'mute\')\" translate=\"mute_explanation_modal.mute_thread\" class=\"mute-explanation-modal__mute-thread\"></button><button type=\"button\" ng-click=\"$close()\" translate=\"common.action.cancel\" class=\"mute-explanation-modal__cancel\"></button></div></div>");
$templateCache.put("generated/components/navbar/navbar.html","<header role=\"banner\" class=\"lmo-navbar\"><section role=\"navigation\" class=\"lmo-navbar-item-container lmo-navbar-item-container--left\"><div ng-if=\"isLoggedIn()\" ng-class=\"{\'lmo-navbar__item--selected\': selected == \'dashboardPage\'}\" class=\"lmo-navbar__item\"><a lmo-href=\"/dashboard\" title=\"{{ \'navbar.recent_title\' | translate }}\" tabindex=\"1\" ng-click=\"homePageClicked()\" class=\"btn lmo-navbar__btn lmo-navbar__btn-icon lmo-navbar__recent\"> <i class=\"fa fa-lg fa-clock-o\"></i> <span translate=\"navbar.recent\" class=\"lmo-navbar__btn-label\"></span></a></div><div ng-if=\"isLoggedIn()\" ng-class=\"{\'lmo-navbar__item--selected\': selected == \'inboxPage\'}\" class=\"lmo-navbar__item\"><a lmo-href=\"/inbox\" title=\"{{ \'navbar.unread_title\' | translate }}\" tabindex=\"2\" class=\"btn lmo-navbar__btn lmo-navbar__btn-icon has-badge\"> <i class=\"fa fa-lg fa-inbox\"></i> <span translate=\"navbar.unread\" class=\"lmo-navbar__btn-label\"></span><span ng-show=\"unreadThreadCount() &gt; 0\" class=\"badge\">{{unreadThreadCount()}}</span></a></div><div ng-if=\"isLoggedIn()\" ng-class=\"{\'lmo-navbar__item--selected\': selected == \'groupsPage\'}\" class=\"lmo-navbar__item\"><a lmo-href=\"/groups\" title=\"{{ \'navbar.groups_title\' | translate }}\" tabindex=\"3\" class=\"groups-item btn lmo-navbar__btn-icon lmo-navbar__btn\"> <i class=\"fa fa-lg fa-group\"></i> <span translate=\"navbar.groups\" class=\"lmo-navbar__btn-label\"></span></a></div><div class=\"lmo-navbar__item lmo-navbar__logo\"><img src=\"img/logo.png\"><span ng-if=\"!officialLoomio\">{{hostName}}</span></div></section><div class=\"lmo-navbar-item-container lmo-navbar-item-container--right\"><section role=\"search\" class=\"lmo-navbar-item-container__sub lmo-navbar-item-container__sub--left\"><div class=\"lmo-navbar__item\"><navbar_search></navbar_search></div></section><section aria-label=\"{{ \'navbar.user_actions\' | translate }}\" class=\"lmo-navbar-item-container__sub lmo-navbar-item-container__sub--right\"><div ng-if=\"isLoggedIn()\" class=\"lmo-navbar__logged-in\"><div ng-if=\"isLoggedIn()\" class=\"lmo-navbar__item lmo-navbar__item--notifications\"><notifications></notifications></div><div ng-if=\"isLoggedIn()\" class=\"lmo-navbar__item lmo-navbar__item--user\"><navbar_user_options></navbar_user_options></div></div><div ng-if=\"!isLoggedIn()\" class=\"lmo-navbar__logged-out\"> <button ng-click=\"goToSignIn()\" class=\"lmo-navbar__sign-in\"><span translate=\"navbar.sign_in\"></span></button> </div></section></div></header>");
$templateCache.put("generated/components/navbar/navbar_search.html","<div class=\"navbar-search\"><div class=\"navbar-search-input-wrapper\"><label translate=\"navbar.search.placeholder\" class=\"sr-only\"></label><input ng-model=\"query\" ng-model-options=\"{debounce: {default: 400, blur: 200}}\" ng-change=\"getSearchResults(query)\" placeholder=\"{{ \'navbar.search.placeholder\' | translate }}\" ng-focus=\"focused = true\" ng-blur=\"handleSearchBlur()\" tabindex=\"2\" class=\"navbar-search-input form-control\" id=\"primary-search-input\"><i ng-hide=\"query\" aria-hidden=\"true\" class=\"fa fa-lg fa-fw fa-search navbar-search-input-icon\"></i><i ng-show=\"query\" ng-click=\"clearAndFocusInput()\" title=\"{{ \'navbar.search.close\' | translate }}\" class=\"fa fa-lg fa-fw fa-times navbar-search-input-icon\"></i></div><div ng-show=\"showDropdown()\" class=\"navbar-search-results\"><ul class=\"group-selector-list selector-list\"><li ng-show=\"groups().length &gt; 0\" class=\"navbar-search-list-item selector-list-header\"><h3 translate=\"common.groups\" class=\"lmo-dropdown-heading\"></h3></li><li ng-repeat=\"group in groups() | orderBy: \'fullName\' track by group.id\" ng-class=\"{\'selector-list-item-no-bottom-line\': (queryEmpty()), \'selector-list-item-top-line\': (queryEmpty() &amp;&amp; group.isParent())}\" class=\"navbar-search-list-item navbar-search-list-option selector-list-item media\"><a lmo-href-for=\"group\" ng-mousedown=\"closeSearchDropdown($event)\" ng-blur=\"handleSearchBlur()\" class=\"selector-list-item-link\"><div class=\"media-left\"><div ng-if=\"group.isSubgroup() &amp;&amp; queryEmpty()\" class=\"selector-list-item-group-logo\"></div><img ng-if=\"group.isParent() || queryPresent()\" ng-src=\"{{group.logoUrl()}}\" aria-hidden=\"true\" class=\"selector-list-item-group-logo\"></div><div class=\"selector-list-item-group-name media-body\"><div ng-if=\"queryPresent()\" class=\"blank\">{{ group.fullName }}</div><div ng-if=\"queryEmpty()\" ng-class=\"{\'font-bold\': group.isParent()}\" class=\"blank\">{{ group.name }}</div></div></a></li></ul><ul ng-show=\"query\" class=\"thread-list selector-list\"><li ng-show=\"searching\" class=\"navbar-search-list-item selector-list-item search-loading\"><loading></loading></li><li ng-show=\"noResultsFound()\" translate=\"navbar.search.no_results\" class=\"navbar-search-list-item selector-list-item no-results-found\"></li><li ng-show=\"searchResults &amp;&amp; !(searching || noResultsFound())\" class=\"navbar-search-list-item selector-list-header\"><h3 translate=\"navbar.search.discussions\" class=\"lmo-dropdown-heading\"></h3></li><li ng-show=\"!(searching || noResultsFound())\" ng-repeat=\"searchResult in searchResults | orderBy: [\'-rank\', \'-lastActivityAt\']\" class=\"navbar-search-list-item navbar-search-list-option selector-list-item media\"><a lmo-href-for=\"searchResult\" ng-mousedown=\"closeSearchDropdown($event)\" ng-blur=\"handleSearchBlur()\" class=\"search-result selector-list-item-link\"><search_result result=\"searchResult\"></search_result></a></li></ul></div></div>");
$templateCache.put("generated/components/navbar/navbar_user_options.html","<div class=\"navbar-user-options\"><div uib-dropdown=\"true\" class=\"blank\"><button tabindex=\"5\" uib-dropdown-toggle=\"true\" class=\"btn lmo-btn-nude lmo-navbar__btn lmo-navbar__btn-icon\"><div translate=\"navbar.user_options.label\" class=\"sr-only\"></div><user_avatar user=\"currentUser\" size=\"small\" ng-if=\"currentUser.avatarKind != \'initials\'\"></user_avatar><div ng-if=\"currentUser.avatarKind == \'initials\'\" class=\"navbar-user-options__user-profile-icon user-avatar\"><i class=\"fa fa-lg fa-user\"></i></div></button><div class=\"uib-dropdown-menu lmo-dropdown-menu lmo-dropdown-menu--with-icons user-options-dropdown\"><ul class=\"lmo-dropdown-menu-items\"><li class=\"lmo-dropdown-menu-item\"><a lmo-href=\"/profile\" class=\"navbar-user-options__profile-link\"> <i class=\"fa fa-lg fa-cog\"></i> <span translate=\"navbar.user_options.profile\"></span></a></li><li class=\"lmo-dropdown-menu-item\"><a lmo-href=\"/email_preferences\" class=\"navbar-user-options__email-settings-link\"> <i class=\"fa fa-envelope\"></i> <span translate=\"navbar.user_options.email_settings\"></span></a></li><li class=\"lmo-dropdown-menu-item\"><a lmo-href=\"{{helpLink()}}\" target=\"_blank\" class=\"navbar-user-options__help-link\"> <i class=\"fa fa-info-circle\"></i> <span translate=\"navbar.user_options.help\"></span></a></li><li ng-if=\"showContactUs()\" class=\"lmo-dropdown-menu-item\"><a ng-click=\"contactUs()\" class=\"navbar-user-options__contact-us-link\"> <i class=\"fa fa-question-circle\"></i> <span translate=\"navbar.user_options.contact_us\"></span></a></li><li class=\"lmo-dropdown-menu-item\"><a ng-click=\"signOut()\" class=\"navbar-user-options__sign-out-link\"> <i class=\"fa fa-lg fa-sign-out\"></i> <span translate=\"navbar.user_options.sign_out\"></span></a></li></ul></div></div></div>");
$templateCache.put("generated/components/navbar/search_result.html","<div class=\"blank\"><div class=\"pull-right\"> <smart_time time=\"result.lastActivityAt\"></smart_time> </div><div class=\"search-result-item\"><div class=\"search-result-title\">{{ result.title }}</div><div class=\"search-result-group-name\">{{ result.resultGroupName }}</div><div ng-if=\"result.blurb\" class=\"search-result-blurb\"><span ng-if=\"showBlurbLeader()\" class=\"search-result__leader\">…</span><span ng-bind-html=\"result.blurb\" class=\"search-result__blurb\"></span><span ng-if=\"showBlurbTrailer()\" class=\"search-result__trailer\">…</span></div></div></div>");
$templateCache.put("generated/components/group_page/cover_photo_form/cover_photo_form.html","<div class=\"cover-photo-form\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"group_cover_modal.heading\" class=\"lmo-h1 modal-title\"></h1></div><div class=\"modal-body\"><button ng-click=\"selectFile()\" class=\"lmo-btn-link\"><div class=\"lmo-box--small lmo-float--left\"><div class=\"user-avatar__initials--small\"><i class=\"fa fa-lg fa-camera\"></i></div></div><span translate=\"group_cover_modal.upload_link\" class=\"lmo-option-text\"></span></button><div class=\"lmo-clearfix\"></div><input type=\"file\" ng-model=\"files\" ng-file-select=\"upload(files)\" class=\"hidden cover-photo-form__file-input\"><p translate=\"group_cover_modal.helptext\"></p><p translate=\"group_cover_modal.image_size_helptext\"></p></div><div class=\"modal-footer lmo-clearfix\"><button ng-click=\"$close()\" type=\"button\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button></div></div>");
$templateCache.put("generated/components/group_page/discussions_card/discussions_card.html","<section aria-labelledby=\"threads-card-title\" class=\"discussions-card\"><div class=\"discussions-card__header\"><h2 translate=\"group_page.discussions\" class=\"lmo-card-heading\" id=\"threads-card-title\"></h2><button ng-if=\"isMemberOfGroup()\" ng_click=\"openDiscussionForm()\" title=\"{{ \'navbar.start_thread\' | translate }}\" class=\"discussions-card__new-thread-button\"> <i class=\"fa fa-plus\"></i> <span translate=\"navbar.start_thread\"></span></button><div translate=\"group_page.discussions_placeholder\" ng-if=\"showThreadsPlaceholder()\" class=\"lmo-placeholder\"></div></div><div ng-if=\"!loadMoreExecuting &amp;&amp; !discussions.any()\" class=\"discussions-card__list--empty\"><div translate=\"group_page.thread_list.empty.{{whyImEmpty()}}\" class=\"discussions-card__list-empty-reason\"></div><div ng-if=\"howToGainAccess()\" class=\"discussions-card__how-to-gain-access\"><span translate=\"group_page.thread_list.empty.{{howToGainAccess()}}\"></span></div></div><div class=\"discussions-card__list\"><section ng-if=\"discussions.any()\" class=\"thread-preview-collection__container\"><thread_preview_collection query=\"discussions\" class=\"thread-previews-container\"></thread_preview_collection></section><div ng-if=\"canLoadMoreDiscussions\" class=\"lmo-show-more\"><button ng-hide=\"loadMoreExecuting\" ng-click=\"loadMore()\" translate=\"common.action.show_more\" class=\"discussions-card__show-more\"></button></div><loading ng-show=\"loadMoreExecuting\"></loading></div></section>");
$templateCache.put("generated/components/group_page/gift_card/gift_card.html","<div class=\"blank\"><section ng-if=\"show()\" class=\"gift-card\"><h2 translate=\"gift_card.heading\" class=\"lmo-card-heading\"></h2><p translate=\"gift_card.body\" translate-value-name=\"{{group.name}}\"></p><button ng-click=\"makeDonation()\" class=\"gift-card__confirm-button\"> <i class=\"fa fa-lg fa-gift\"></i> <span translate=\"gift_card.make_a_contribution\"></span></button></section></div>");
$templateCache.put("generated/components/group_page/group_previous_proposals_card/group_previous_proposals_card.html","<div class=\"blank\"><section ng-if=\"showPreviousProposals()\" aria-labelledby=\"group-previous-proposals-card__title\" class=\"group-previous-proposals-card\"><h2 translate=\"group_previous_proposals_card.heading\" class=\"lmo-card-heading\" id=\"group-previous-proposals-card__title\"></h2><ul class=\"group-previous-proposals-card__previous_proposals\"><li ng-repeat=\"proposal in group.closedProposals() | limitTo: 3 track by proposal.id\" class=\"group-previous-proposals-card__previous_proposal\"><pie_with_position proposal=\"proposal\" class=\"pull-left\"></pie_with_position><a lmo-href-for=\"group\" lmo-href-action=\"previous_proposals\"><div class=\"group-previous-proposals-card__proposal-title\">{{proposal.name}}</div></a></li></ul><a lmo-href-for=\"group\" lmo-href-action=\"previous_proposals\" class=\"group-previous-proposals-card__link lmo-card-minor-action\"><span translate=\"group_previous_proposals_card.see_more\"></span></a></section></div>");
$templateCache.put("generated/components/group_page/group_actions_dropdown/group_actions_dropdown.html","<div uib-dropdown=\"true\" class=\"group-page-actions\"><button uib-dropdown-toggle=\"true\" class=\"lmo-btn--nude group-page-actions__button\"> <span translate=\"group_page.options.label\"></span> <i class=\"fa fa-lg fa-angle-down\"></i></button><div role=\"menu\" class=\"uib-dropdown-menu lmo-dropdown-menu lmo-dropdown-menu--with-icons\"><ul class=\"lmo-dropdown-menu-items\"><li ng-if=\"groupActions.canEditGroup()\" class=\"lmo-dropdown-menu-item\"><a ng-click=\"groupActions.editGroup()\" class=\"group-page-actions__edit-group-link\"> <i class=\"fa fa-lg fa-cog\"></i> <span translate=\"group_page.options.edit_group\"></span></a></li><li ng-if=\"groupActions.canAdministerGroup()\" class=\"lmo-dropdown-menu-item\"><a lmo-href-for=\"group\" lmo-href-action=\"memberships\" class=\"group-page-actions__manage-memberships-link\"> <i class=\"fa fa-lg fa-users\"></i> <span translate=\"group_page.options.manage_members\"></span></a></li><li ng-if=\"groupActions.canManageGroupSubscription()\" class=\"lmo-dropdown-menu-item\"><a ng-if=\"group.subscriptionKind == \'paid\'\" ng-click=\"groupActions.manageSubscriptions()\" class=\"group-page-actions__manage-subscription-link\"> <i class=\"fa fa-lg fa-calendar-check-o\"></i> <span translate=\"group_page.options.manage_subscription\"></span></a><a ng-if=\"group.subscriptionKind == \'gift\'\" ng-click=\"groupActions.choosePlan()\" class=\"group-page-actions__manage-subscription-link\"> <i class=\"fa fa-lg fa-gift\"></i> <span translate=\"group_page.options.manage_subscription\"></span></a></li><li ng-if=\"groupActions.canAddSubgroup()\" class=\"lmo-dropdown-menu-item\"><a ng-click=\"groupActions.addSubgroup()\" class=\"group-page-actions__add-subgroup-link\"> <i class=\"fa fa-lg fa-plus\"></i> <span translate=\"group_page.options.add_subgroup\"></span></a></li><li ng-if=\"groupActions.canChangeVolume()\" class=\"lmo-dropdown-menu-item\"><a ng-click=\"groupActions.openChangeVolumeForm()\" class=\"group-page-actions__change-volume-link\"> <i class=\"fa fa-lg fa-bell\"></i> <span translate=\"group_page.options.email_settings\"></span></a></li><li class=\"lmo-dropdown-menu-item\"><a ng-click=\"groupActions.leaveGroup()\" class=\"group-page-actions__leave-group\"> <i class=\"fa fa-lg fa-sign-out\"></i> <span translate=\"group_page.options.leave_group\"></span></a></li><li ng-if=\"groupActions.canArchiveGroup()\" class=\"lmo-dropdown-menu-item\"><a ng-click=\"groupActions.archiveGroup()\" class=\"group-page-actions__archive-group\"> <i class=\"fa fa-lg fa-ban\"></i> <span translate=\"group_page.options.deactivate_group\"></span></a></li></ul></div></div>");
$templateCache.put("generated/components/group_page/group_help_card/group_help_card.html","<div class=\"blank\"><section ng-if=\"showHelpCard()\" class=\"group-help-card\"><h2 translate=\"group_help_card.title\" class=\"lmo-card-heading\"></h2><div class=\"group-help-card__video-wrapper\"><div ng-if=\"showVideo\" class=\"lmo-bank\"><iframe width=\"269\" height=\"150\" src=\"https://www.youtube.com/embed/pF-wpXo8Rdw?showinfo=0&nologo=1\" frameborder=\"0\" allowfullscreen></iframe></div></div><div class=\"group-help-card__articles\"><div class=\"media\"><div class=\"media-left\"><img src=\"/img/10-tips.png\" alt=\"Weaving in agenda points\" class=\"group-help-card__article-thumbnail\"></div><div class=\"media-body\"><a href=\"http://blog.loomio.org/2015/09/10/10-tips-for-making-great-decisions-with-loomio/\" title=\"10 tips for making great decisions with Loomio\" target=\"_blank\" class=\"group-help-card__article-title\"><span translate=\"group_help_card.ten_tips_article_title\"></span></a></div></div><div class=\"media\"><div class=\"media-left\"><img src=\"/img/conversation-to-action.png\" alt=\"Caring work environment\" class=\"group-help-card__article-thumbnail\"></div><div class=\"media-body\"><a href=\"http://blog.loomio.org/2015/09/18/9-ways-to-use-a-loomio-proposal-to-turn-a-conversation-into-action/\" title=\"9 ways to use a Loomio proposal to turn a conversation into action\" target=\"_blank\" class=\"group-help-card__article-title\"><span translate=\"group_help_card.nine_ways_to_use_proposals\"></span></a></div></div></div><a lmo-href=\"{{helpLink()}}\" target=\"_blank\" class=\"group-help-card__more-help lmo-card-minor-action\"><span translate=\"common.more_help\"></span></a></section></div>");
$templateCache.put("generated/components/group_page/group_privacy_button/group_privacy_button.html","<button uib-popover=\"{{privacyDescription()}}\" title=\"{{privacyDescription()}}\" class=\"group-privacy-button\"><div translate=\"group_page.privacy.aria_label\" translate-value-privacy=\"{{group.groupPrivacy}}\" class=\"sr-only\"></div><div aria-hidden=\"true\" class=\"screen-only\"> <i ng-class=\"iconClass()\" class=\"fa fa-lg\"></i> <span translate=\"common.privacy.{{group.groupPrivacy}}\"></span></div></button>");
$templateCache.put("generated/components/group_page/join_group_button/join_group_button.html","<div class=\"blank\"><div ng-if=\"!isMember()\" class=\"join-group-button\"><div ng-if=\"canJoinGroup()\" class=\"blank\"><button translate=\"join_group_button.join_group\" ng-click=\"joinGroup()\" class=\"join-group-button__join-group\"></button></div><div ng-if=\"canRequestMembership()\" class=\"blank\"><button translate=\"join_group_button.ask_to_join_group\" ng-click=\"requestToJoinGroup()\" class=\"join-group-button__ask-to-join-group\"></button></div></div></div>");
$templateCache.put("generated/components/group_page/group_welcome_modal/group_welcome_modal.html","<div class=\"group-welcome-modal\"><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"group_welcome_modal.heading\" class=\"lmo-h1 modal-title\"></h1></div><div class=\"modal-body\"><p translate=\"group_welcome_modal.first_step\"></p><div ng-if=\"showVideo\" class=\"group-welcome-model__video-wrapper\"><iframe src=\"https://www.youtube.com/embed/pF-wpXo8Rdw?showinfo=0&amp;nologo=1\" frameborder=\"0\" class=\"group-welcome-modal__video\"></iframe></div><p translate=\"group_welcome_modal.second_step\"></p></div><div class=\"modal-footer lmo-clearfix\"><button type=\"button\" ng-click=\"$close()\" translate=\"group_welcome_modal.ok_got_it\" class=\"lmo-btn--primary group-welcome-modal__close-button\"></button></div></div>");
$templateCache.put("generated/components/group_page/group_theme/group_theme.html","<div class=\"group-theme\"><div ng-style=\"coverStyle()\" class=\"group-theme__cover\"><div ng-mouseover=\"themeHoverIn()\" ng-mouseleave=\"themeHoverOut()\" ng-if=\"canUploadPhotos()\" class=\"group-theme__upload-photo\"><button ng-click=\"openUploadCoverForm()\" title=\"{{ \'group_page.new_photo\' | translate }}\" class=\"lmo-btn-link\"><i class=\"fa fa-lg fa-camera\"></i><span ng-show=\"themeHover\" translate=\"group_page.new_photo\" class=\"group-theme__upload-help-text\"></span></button></div></div><div ng-if=\"compact\" class=\"group-theme__header--compact\"><div aria-hidden=\"true\" class=\"group-theme__logo--compact\"><a lmo-href-for=\"group\"><img ng-src=\"{{group.logoUrl()}}\"></a></div><div class=\"group-theme__name--compact\"><a ng-if=\"group.isSubgroup()\" lmo-href-for=\"group.parent()\">{{group.parentName()}}</a> <span ng-if=\"group.isSubgroup()\">-</span> <a lmo-href-for=\"group\">{{group.name}}</a></div></div><div ng-if=\"!compact\" class=\"group-theme__header\"><div ng-style=\"logoStyle()\" alt=\"{{ \'group_page.group_logo\' | translate }}\" class=\"group-theme__logo\"><div ng-mouseover=\"logoHoverIn()\" ng-mouseleave=\"logoHoverOut()\" ng-if=\"canUploadPhotos()\" class=\"group-theme__upload-photo\"><button ng-click=\"openUploadLogoForm()\" title=\"{{ \'group_page.new_photo\' | translate }}\" class=\"lmo-btn-link\"><i class=\"fa fa-lg fa-camera\"></i><span ng-show=\"logoHover\" translate=\"group_page.new_photo\" class=\"group-theme__upload-help-text\"></span></button></div></div><div class=\"group-theme__name-and-actions\"><h1 aria-label=\"breadcrumb\" role=\"navigation\" class=\"lmo-h1 group-theme__name\"><a ng-if=\"group.isSubgroup()\" lmo-href-for=\"group.parent()\" aria-level=\"1\">{{group.parentName()}}</a> <span ng-if=\"group.isSubgroup()\">-</span> <a lmo-href-for=\"group\" aria-level=\"2\">{{group.name}}</a></h1><div ng-if=\"homePage\" class=\"group-theme__actions\"><div ng-if=\"isMember()\" class=\"group-theme__member-actions\"><div class=\"pull-right\"><group_actions_dropdown group=\"group\"></group_actions_dropdown></div><group_privacy_button group=\"group\"></group_privacy_button></div><join_group_button group=\"group\"></join_group_button></div><div class=\"clearfix\"></div></div></div></div>");
$templateCache.put("generated/components/group_page/logo_photo_form/logo_photo_form.html","<div class=\"logo-photo-form\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"group_logo_modal.heading\" class=\"lmo-h1 modal-title\"></h1></div><div class=\"modal-body\"><button ng-click=\"selectFile()\" class=\"lmo-btn-link\"><div class=\"lmo-box--small lmo-float--left\"><div class=\"user-avatar__initials--small\"><i class=\"fa fa-lg fa-camera\"></i></div></div><span translate=\"group_logo_modal.upload_link\" class=\"lmo-option-text\"></span></button><div class=\"lmo-clearfix\"></div><input type=\"file\" ng-model=\"files\" ng-file-select=\"upload(files)\" class=\"hidden logo-photo-form__file-input\"><p translate=\"group_logo_modal.image_size_helptext\"></p></div><div class=\"modal-footer lmo-clearfix\"><button ng-click=\"$close()\" type=\"button\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button></div></div>");
$templateCache.put("generated/components/group_page/members_card/members_card.html","<div class=\"blank\"><section ng-if=\"canViewMemberships()\" aria-labelledby=\"members-card-title\" class=\"members-card\"><h2 translate=\"group_page.members\" class=\"lmo-card-heading\" id=\"members-card-title\"></h2><div class=\"members-card__list\"><div ng-if=\"group.memberships().length &gt; 1\" ng-repeat=\"membership in group.memberships() | orderBy: \'-admin\' | limitTo:10\" class=\"members-card__avatar\"><user_avatar user=\"membership.user()\" coordinator=\"membership.admin\" size=\"medium\"></user_avatar></div><div translate=\"group_page.members_placeholder\" ng-if=\"showMembersPlaceholder()\" class=\"lmo-placeholder\"></div></div><div ng-if=\"canAddMembers()\" class=\"members-card__invite-members\"><button ng_click=\"invitePeople()\" class=\"members-card__invite-members-btn\"> <i class=\"fa fa-lg fa-plus\"></i> <span translate=\"group_page.invite_people\"></span></button></div><a lmo-href-for=\"group\" lmo-href-action=\"memberships\" class=\"members-card__manage-members\"><span translate=\"group_page.all_members\" translate-value-count=\"{{group.membershipsCount}}\"></span></a></section></div>");
$templateCache.put("generated/components/group_page/membership_request_form/membership_request_form.html","<form ng-submit=\"submit()\" ng-disabled=\"membership_request.processing\" class=\"membership-request-form\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"membership_request_form.heading\" class=\"lmo-h1\"></h1></div><div class=\"modal-body\"><fieldset><div class=\"lmo-form-group\"><label for=\"membership-request-name\" translate=\"membership_request_form.name_label\"></label><input ng-model=\"membershipRequest.name\" ng-required=\"true\" ng-disabled=\"isLoggedIn()\" class=\"membership-request-form__name form-control\" id=\"membership-request-name\"></div><div class=\"lmo-form-group\"><label for=\"membership-request-email\" translate=\"membership_request_form.email_label\"></label><input ng-model=\"membershipRequest.email\" ng-required=\"true\" ng-disabled=\"isLoggedIn()\" class=\"membership-request-form__email form-control\" id=\"membership-request-email\"></div><div class=\"lmo-form-group\"><label for=\"membership-request-introduction\" translate=\"membership_request_form.introduction_label\"></label><textarea ng-model=\"membershipRequest.introduction\" ng-required=\"false\" class=\"lmo-textarea membership-request-form__introduction form-control\" id=\"membership-request-introduction\"></textarea></div></fieldset></div><div class=\"modal-footer\"><button type=\"submit\" translate=\"membership_request_form.submit_button\" class=\"membership-request-form__submit-btn\"></button><button ng-click=\"$close()\" type=\"button\" translate=\"common.action.cancel\" class=\"membership-request-form__cancel-btn\"></button></div></form>");
$templateCache.put("generated/components/group_page/subgroups_card/subgroups_card.html","<div class=\"blank\"><section ng-if=\"showSubgroupsCard()\" aria-labelledby=\"subgroups-card__title\" class=\"subgroups-card\"><h2 translate=\"group_page.subgroups\" class=\"lmo-card-heading\" id=\"subgroups-card__title\"></h2><ul class=\"subgroups-card__list\"><li ng-repeat=\"subgroup in group.subgroups() | orderBy: \'name\' track by subgroup.id\" class=\"subgroups-card__list-item\"><div class=\"subgroups-card__list-item-logo\"><group_avatar group=\"subgroup\" size=\"medium\"></group_avatar></div><div class=\"subgroups-card__list-item-name\"><a lmo-href-for=\"subgroup\">{{ subgroup.name }}</a></div><div class=\"subgroups-card__list-item-description\">{{ subgroup.description | truncate }}</div></li></ul><button ng-click=\"startSubgroup()\" ng-if=\"canCreateSubgroups()\" class=\"subgroups-card__add-subgroup-link\"><span translate=\"common.action.add_subgroup\"></span></button></section></div>");
$templateCache.put("generated/components/group_page/membership_requests_card/membership_requests_card.html","<div class=\"blank\"><section ng-if=\"canManageMembershipRequests() &amp;&amp; group.hasPendingMembershipRequests()\" class=\"membership-requests-card\"><h2 translate=\"membership_requests_card.heading\" class=\"lmo-card-heading\"></h2><ul class=\"membership-requests-card__pending-requests\"><li ng-repeat=\"membershipRequest in group.pendingMembershipRequests() | orderBy: \'-createdAt\' | limitTo: 5 track by membershipRequest.id\" class=\"media\"><a lmo-href-for=\"group\" lmo-href-action=\"membership_requests\" title=\"{{ \'membership_requests_card.manage_requests\' | translate }}\"><div class=\"media-left\"><user_avatar user=\"membershipRequest.actor()\" size=\"medium\"></user_avatar></div><div class=\"media-body\"><span class=\"membership-requests-card__requestor-name\">{{membershipRequest.actor().name}}</span><div class=\"lmo-truncate membership-requests-card__requestor-introduction\">{{membershipRequest.introduction}}</div></div></a></li></ul><a lmo-href-for=\"group\" lmo-href-action=\"membership_requests\" class=\"membership-requests-card__link lmo-card-minor-action\"><span translate=\"membership_requests_card.manage_requests_with_count\" translate-value-count=\"{{group.pendingMembershipRequests().length}}\"></span></a></section></div>");
$templateCache.put("generated/components/group_page/subscription_success_modal/subscription_success_modal.html","<div class=\"subscription-success-modal\"><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"subscription_success_modal.heading\" class=\"lmo-h1 modal-title\"></h1></div><div class=\"modal-body\"><img src=\"img/mascot.png\" class=\"subscription-success-modal__mascot\"><div class=\"subscription-success-modal__message\"><p translate=\"subscription_success_modal.receipt\"></p><p><span translate=\"subscription_success_modal.change_subscription\"></span><span><button translate=\"subscription_success_modal.contact_link\" ng-click=\"openIntercom()\" class=\"subscription-success-modal__contact-link\"></button></span></p><p translate=\"subscription_success_modal.sign_off\"></p></div></div><div class=\"modal-footer lmo-clearfix\"><button type=\"button\" ng-click=\"$close()\" translate=\"subscription_success_modal.ok_got_it\" class=\"lmo-btn--submit\"></button></div></div>");
$templateCache.put("generated/components/group_page/trial_card/trial_card.html","<div class=\"blank\"><section ng-if=\"show()\" class=\"trial-card\"><h2 translate=\"trial_card.title\" class=\"lmo-card-heading\" id=\"trial-card__title\"></h2><p ng-if=\"!isExpired()\" translate=\"trial_card.in_progress_body\" translate-values=\"{name: group.name}\"></p><p ng-if=\"isExpired()\" translate=\"trial_card.expired_body_html\" translate-values=\"{name: group.name}\"></p><button ng-click=\"choosePlan()\" class=\"trial-card__choose-plan-button\"> <i class=\"fa fa-lg fa-calendar-check-o\"></i> <span translate=\"trial_card.choose_plan\"></span></button></section></div>");
$templateCache.put("generated/components/invitation_form/add_members_modal/add_members_modal.html","<div class=\"lmo-blank\"><loading ng-if=\"loadExecuting\"></loading><div ng-if=\"!loadExecuting\" class=\"add-members-modal\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"add_members_modal.heading\" translate-values=\"{name: group.parentName()}\" class=\"lmo-h1 modal-title\"></h1></div><div class=\"modal-body\"><div ng-if=\"!canAddMembers()\" class=\"add-members-modal__empty-list\"><p translate=\"add_members_modal.no_members_to_add\" translate-value-parent=\"{{group.parentName()}}\"></p></div><div ng-if=\"canAddMembers()\" class=\"add-members-modal__list\"><label ng-repeat=\"member in members()\" class=\"add-members-modal__list-item\"><input type=\"checkbox\" checklist-model=\"selectedIds\" checklist-value=\"member.id\"><user_avatar user=\"member\" size=\"small\"></user_avatar><strong>{{member.name}}</strong>&nbsp;(@{{member.username}})</label></div></div><div class=\"modal-footer lmo-clearfix\"><button type=\"button\" ng-click=\"reopenInvitationsForm()\" translate=\"common.action.back\" class=\"lmo-btn--cancel\"></button><button type=\"button\" ng-click=\"submit()\" translate=\"add_members_modal.add_members\" ng-if=\"canAddMembers()\" class=\"lmo-btn--submit add-members-modal__submit\"></button></div></div></div>");
$templateCache.put("generated/components/memberships_page/admin_memberships_panel/admin_memberships_panel.html","<div class=\"blank\"><div class=\"row memberships-page__table-row\"><div class=\"col-xs-7\"></div><div translate=\"memberships_page.coordinator_label\" class=\"lmo-bold col-xs-3 hidden-xs align-center\"></div><div translate=\"memberships_page.remove_member_label\" class=\"lmo-bold col-xs-2 hidden-xs align-center\"></div></div><div ng-repeat=\"membership in memberships() | orderBy: \'-admin\' track by membership.id\" data-username=\"{{membership.user().username}}\" class=\"row memberships-page__table-row memberships-page__membership\"><div class=\"col-xs-7\"><div class=\"media\"><div class=\"media-left hidden-xs\"><user_avatar user=\"membership.user()\" size=\"medium\" coordinator=\"membership.admin\"></user_avatar></div><div class=\"media-body\"><div class=\"memberships-page__member-info\"><a lmo-href-for=\"membership.user()\">{{::membership.user().name}}</a><div>@{{::membership.user().username}}</div></div></div></div></div><div class=\"col-xs-3 align-center\"><input type=\"checkbox\" ng-model=\"membership.admin\" ng-change=\"toggleAdmin(membership)\" ng-disabled=\"!canToggleAdmin(membership)\" class=\"memberships-page__make-coordinator\"></div><div class=\"col-xs-2 align-center\"><button ng-click=\"openRemoveForm(membership)\" ng-show=\"canRemoveMembership(membership)\" class=\"memberships-page__remove-link\"><i class=\"fa fa-lg fa-times-circle\"></i></button></div></div><div class=\"row memberships-page__table-row\"><div ng-if=\"canAddMembers()\" class=\"members-card__invite-members col-xs-6\"><button ng_click=\"invitePeople()\" class=\"lmo-btn--featured lmo-btn--block lmo-btn--icon\"> <i class=\"fa fa-lg fa-plus\"></i> <span translate=\"group_page.invite_people\"></span></button></div></div></div>");
$templateCache.put("generated/components/memberships_page/pending_invitations_card/pending_invitations_card.html","<div class=\"blank\"><section ng-if=\"canSeeInvitations() &amp;&amp; group.hasPendingInvitations()\" class=\"pending-invitations-card\"><h3 translate=\"pending_invitations_card.heading\" class=\"lmo-card-heading\"></h3><table class=\"pending-invitations-card__pending-invitations table\"><thead><tr><th translate=\"pending_invitations_card.email\" class=\"pending_invitations_card__email-heading\"></th><th translate=\"pending_invitations_card.invitation_link\" class=\"pending-invitations-card__invitation-url-heading\"></th><th translate=\"pending_invitations_card.sent\" class=\"pending-invitations-card__sent-heading\"></th><th></th></tr></thead><tbody><tr ng-repeat=\"invitation in group.pendingInvitations() track by invitation.id\"><td class=\"pending-invitations-card__email\">{{invitation.recipientEmail}}</td><td class=\"pending-invitations-card__invitation-url\">{{baseUrl}}invitations/{{invitation.token}}</td><td class=\"pending-invitations-card__sent\">{{invitationCreatedAt(invitation)}}</td><td class=\"align-center\"><button ng-click=\"openCancelForm(invitation)\" class=\"pending-invitations-card__cancel-link\"><i class=\"fa fa-lg fa-times-circle\"></i></button></td></tr></tbody></table></section></div>");
$templateCache.put("generated/components/memberships_page/memberships_panel/memberships_panel.html","<div class=\"blank\"><div class=\"row memberships-page__table-row\"></div><div ng-repeat=\"membership in memberships() track by membership.id\" class=\"row memberships-page__table-row memberships-page__membership\"><div class=\"col-xs-8\"><div class=\"media\"><div class=\"media-left hidden-xs\"><user_avatar user=\"membership.user()\" size=\"medium\" coordinator=\"membership.admin\"></user_avatar></div><div class=\"media-body\"><div class=\"memberships-page__member-info\"><a lmo-href-for=\"membership.user()\">{{::membership.user().name}}</a><div>@{{::membership.user().username}}</div></div></div></div></div></div><div class=\"row memberships-page__table-row\"><div ng-if=\"canAddMembers()\" class=\"members-card__invite-members col-xs-6\"><a ng_click=\"invitePeople()\" class=\"lmo-btn--featured lmo-btn--block lmo-btn--icon\"> <i class=\"fa fa-lg fa-plus\"></i> <span translate=\"group_page.invite_people\"></span></a></div></div></div>");
$templateCache.put("generated/components/memberships_page/cancel_invitation_form/cancel_invitation_form.html","<form ng-submit=\"submit()\"><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"cancel_invitation_form.heading\" class=\"lmo-h1\"></h1></div><div class=\"modal-body\"><span translate=\"cancel_invitation_form.question\"></span></div><div class=\"modal-footer\"><button type=\"submit\" translate=\"cancel_invitation_form.submit\" class=\"lmo-btn--danger cancel-invitation-form__submit\"></button><button ng-click=\"$close()\" type=\"button\" translate=\"cancel_invitation_form.cancel\" class=\"lmo-btn--cancel\"></button></div></form>");
$templateCache.put("generated/components/thread_page/comment_form/attachment_form.html","<div class=\"comment-form-attachments\"><button type=\"button\" ng-click=\"selectFile()\" ng-hide=\"files\" aria-label=\"{{ \'comment_form.attachments.aria_label\' | translate }}\" class=\"lmo-btn--default\"><i class=\"fa fa-lg fa-paperclip\"></i></button><input type=\"file\" ng-model=\"files\" ng-file-select=\"upload(files)\" class=\"attachment-form__file-input hidden\"><div ng-repeat=\"file in files\" class=\"attachment-form-in-progress\"><div class=\"progress active attachment-form-progress-field\"><span class=\"attachment-form-progress-text\">{{ file.name }}: {{ percentComplete }} %</span><uib-progressbar ng-attr-value=\"percentComplete\" class=\"attachment-form-progress-bar progress-striped active\"></uib-progressbar></div><button type=\"button\" ng-click=\"abort()\" class=\"close attachment-form-cancel cancel-upload\">&times;</button></div></div>");
$templateCache.put("generated/components/thread_page/comment_form/comment_form.html","<div class=\"blank\"><section ng-if=\"showCommentForm()\" aria-labelledby=\"comment-form-title\"><form ng_submit=\"submit()\" class=\"comment-form\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><input type=\"hidden\" ng-model=\"comment.usesMarkdown\"> <h2 translate=\"comment_form.aria_label\" class=\"lmo-card-heading\" id=\"comment-form-title\"></h2> <span translate=\"comment_form.in_reply_to\" translate-values=\"{name: \'{{comment.parent().authorName()}}\' }\" ng-show=\"comment.parent().authorName()\"></span><div class=\"lmo-relative\"><textarea msd-elastic=\"true\" ng-change=\"storeDraft()\" ng-model-options=\"{ updateOn: \'default blur\', debounce: {\'default\': 300, \'blur\': 0} }\" aria-labelledby=\"comment-form-title\" name=\"body\" placeholder=\"Say something...\" ng_model=\"comment.body\" mentio=\"mentio\" mentio-trigger-char=\"\'@\'\" mentio_items=\"mentionables\" mentio-template-url=\"generated/components/thread_page/comment_form/mentio_menu.html\" mentio-search=\"fetchByNameFragment(term)\" mentio-id=\"comment-field\" ng-focus=\"formInFocus()\" ng-blur=\"formLostFocus()\" class=\"lmo-textarea form-control comment-form__comment-field lmo-primary-form-input\"></textarea><emoji_picker target-selector=\"bodySelector\" class=\"lmo-action-dock\"></emoji_picker></div><validation_errors subject=\"comment\" field=\"body\"></validation_errors><div ng_repeat=\"attachment in comment.newAttachments()\" class=\"comment-row comment-attachments\"></div><div ng-if=\"threadIsPublic()\" translate=\"comment_form.public_privacy_notice\" class=\"comment-form__privacy-notice\"></div><div ng-if=\"threadIsPrivate()\" translate=\"comment_form.private_privacy_notice\" translate-value-group-name=\"{{comment.group().fullName}}\" class=\"comment-form__privacy-notice\"></div><attachment_preview attachment=\"attachment\" mode=\"thumb\" ng-repeat=\"attachment in comment.newAttachments() | orderBy: \'id\' track by attachment.id\"></attachment_preview><div class=\"thread-comment-form-actions\"><button type=\"submit\" ng-disabled=\"submitIsDisabled\" translate=\"comment_form.submit_button.label\" class=\"lmo-btn--submit submit comment-form__submit-button\"></button><button type=\"button\" translate=\"comment_form.cancel_reply\" ng-show=\"comment.parentId\" ng-click=\"comment.parentId = null\" class=\"lmo-btn--default comment-form-button\"></button><attachment_form comment=\"comment\"></attachment_form><button type=\"button\" translate=\"common.action.cancel\" ng-click=\"cancel($event)\" ng-hide=\"comment.isNew()\" class=\"lmo-btn--default\" id=\"post-comment-cancel\"></button><a lmo-href=\"/markdown\" target=\"_blank\" title=\"{{ \'common.formatting_help.title\' | translate }}\" class=\"comment-form-button\"><span translate=\"common.formatting_help.label\"></span></a></div></form></section></div>");
$templateCache.put("generated/components/thread_page/comment_form/delete_comment_form.html","<div class=\"delete-comment-form\"><form ng-submit=\"submit()\" ng-disabled=\"comment.processing\" name=\"deleteCommentForm\"><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h3 translate=\"comment_form.delete_comment\" class=\"modal-title\"></h3></div><div class=\"modal-body\"><div translate=\"comment_form.confirm_delete_message\" class=\"comment-form-delete-message\"></div></div><div class=\"modal-footer\"><button type=\"submit\" translate=\"comment_form.confirm_delete\" class=\"lmo-btn--danger delete-comment-form__delete-button\"></button><button type=\"button\" ng-click=\"$close()\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button></div></form></div>");
$templateCache.put("generated/components/thread_page/comment_form/edit_comment_form.html","<div class=\"edit-comment-form\"><form ng-submit=\"submit()\" ng-disabled=\"comment.processing\" name=\"commentForm\"><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"comment_form.edit_comment\" class=\"lmo-h1 modal-title\"></h1></div><div class=\"modal-body\"><div class=\"lmo-relative\"><textarea name=\"body\" ng_model=\"comment.body\" mentio=\"mentio\" mentio-trigger-char=\"\'@\'\" mentio_items=\"mentionables\" mentio-template-url=\"generated/components/thread_page/comment_form/mentio_menu.html\" mentio-search=\"fetchByNameFragment(term)\" mentio-id=\"comment-field\" ng-model-options=\"{ updateOn: \'default blur\', debounce: {\'default\': 300, \'blur\': 0} }\" class=\"lmo-textarea form-control edit-comment-form__comment-field\"></textarea><emoji_picker target-selector=\"bodySelector\" class=\"lmo-action-dock\"></emoji_picker></div></div><div class=\"modal-footer\"> <button type=\"submit\" translate=\"common.action.save_changes\" class=\"lmo-btn--submit comment-form__submit-btn\"></button> <button type=\"button\" ng-click=\"$close()\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button></div></form></div>");
$templateCache.put("generated/components/thread_page/comment_form/mentio_menu.html","<ul class=\"list-group user-search\"><li mentio_menu_item=\"user\" ng_repeat=\"user in items track by user.id\" class=\"list-group-item\"><div class=\"media-left\"><user_avatar user=\"user\" size=\"small\"></user_avatar></div><div class=\"mentionable-content\"><div class=\"mentionable-name\">{{user.name}}</div><div class=\"mentionable-username\">{{user.username}}</div></div></li></ul>");
$templateCache.put("generated/components/thread_page/current_proposal_card/current_proposal_card.html","<section aria-labelledby=\"current-proposal-card-heading\" class=\"current-proposal-card\"><div class=\"lmo-card-heading-padding\"><h2 translate=\"common.models.proposal\" tabindex=\"0\" class=\"lmo-card-heading\" id=\"current-proposal-card-heading\"></h2></div><proposal_expanded proposal=\"proposal\"></proposal_expanded></section>");
$templateCache.put("generated/components/thread_page/activity_card/activity_card.html","<section aria-labelledby=\"activity-card-title\" class=\"activity-card\"><h2 translate=\"discussion.activity\" class=\"lmo-card-heading\" id=\"activity-card-title\"></h2><a ng-show=\"canLoadBackwards()\" ng-click=\"loadEventsBackwards()\" tabindex=\"0\" class=\"activity-card__load-backwards\"> <i class=\"fa fa-refresh\"></i> <span translate=\"discussion.load_previous\" translate-value-count=\"{{beforeCount()}}\"></span></a><loading ng-show=\"loadEventsBackwardsExecuting\" class=\"activity-card__loading page-loading\"></loading><div ng-if=\"noEvents()\" translate=\"discussion.activity_placeholder\" class=\"activity-card__no-activity lmo-placeholder align-center\"></div><ul class=\"activity-card__activity-list\"><li ng_repeat=\"event in events() track by event.id\" in-view=\"($inview&amp;&amp;threadItemVisible(event)) || (!$inview&amp;&amp;threadItemHidden(event))\" in-view-options=\"{debounce: 100}\" aria-labelledby=\"event-{{event.id}}\" class=\"activity-card__activity-list-item\"><div ng-if=\"$last\" class=\"activity-card__last-item\"></div><div id=\"sequence-{{event.sequenceId}}\" ng-include=\"\'generated/components/thread_page/activity_card/\'+ event.kind + \'.html\'\" ng-if=\"!event.deleted\" class=\"activity-card-content\"></div><div ng-if=\"event.sequenceId == lastReadSequenceId\" ng-class=\"{\'activity-card__new-activity\': hasNewActivity}\" translate=\"activity_card.new_activity\" class=\"activity-card__last-read-activity\"></div></li></ul><loading ng-show=\"loadEventsForwardsExecuting\" class=\"activity-card__loading page-loading\"></loading></section>");
$templateCache.put("generated/components/thread_page/activity_card/discussion_edited.html","<div ng-controller=\"DiscussionEditedItemController\" class=\"thread-item\"><div class=\"thread-item__header media\"><div class=\"media-left\"><user_avatar user=\"event.actor()\" size=\"small\"></user_avatar></div><div class=\"media-body\"><h3 id=\"event-{{event.id}}\" class=\"thread-item__title\"><strong> <a lmo-href-for=\"event.actor()\">{{ event.actorName() }}</a> </strong><span translate=\"discussion_edited_item.{{translationKey}}\" translate-value-title=\"{{title}}\"></span><span><span ng-if=\"onlyPrivacyEdited()\" translate=\"{{privacyKey()}}\"></span></span><timeago timestamp=\"event.createdAt\" class=\"timeago--inline\"></timeago></h3></div></div></div>");
$templateCache.put("generated/components/thread_page/activity_card/discussion_moved.html","<div ng-controller=\"DiscussionMovedItemController\" class=\"thread-item\"><div class=\"thread-item__header media\"><div class=\"media-left\"><user_avatar user=\"event.actor()\" size=\"small\"></user_avatar></div><div class=\"media-body\"><h3 id=\"event-{{event.id}}\" class=\"thread-item__title\"><strong> <a lmo-href-for=\"event.actor()\">{{ event.actorName() }}</a> </strong><span translate=\"discussion_moved_item.discussion_moved\" translate-value-group=\"{{groupName}}\"></span><timeago timestamp=\"event.createdAt\" class=\"timeago--inline\"></timeago></h3></div></div></div>");
$templateCache.put("generated/components/thread_page/activity_card/motion_closed.html","<div ng-controller=\"MotionClosedItemController\" class=\"thread-item\"><div class=\"thread-item__header media\"><div class=\"media-left\"><div class=\"thread-item__proposal-icon\"></div></div><div class=\"media-body\"><h3 id=\"event-{{event.id}}\" class=\"thread-item__title\"><span translate=\"proposal_closed_item.proposal_closed\" translate-values=\"{title: proposal.name}\"></span><timeago timestamp=\"proposal.closingAt\" class=\"timeago--inline\"></timeago></h3></div></div></div>");
$templateCache.put("generated/components/thread_page/activity_card/motion_closed_by_user.html","<div class=\"thread-item\"><div class=\"thread-item__header media\"><div class=\"media-left\"><div class=\"thread-item__proposal-icon\"></div></div><div class=\"media-body\"><h3 class=\"thread-item__title\"><strong> <a lmo-href-for=\"event.actor()\">{{ event.actorName() }}</a> </strong><span id=\"event-{{event.id}}\" translate=\"proposal_closed_by_user_item.proposal_closed_by_user\" translate-value-title=\"{{event.proposal().name}}\"></span><timeago timestamp=\"proposal.createdAt\" class=\"timeago--inline\"></timeago></h3></div></div></div>");
$templateCache.put("generated/components/thread_page/activity_card/motion_edited.html","<div ng-controller=\"MotionEditedItemController\" class=\"thread-item\"><div class=\"thread-item__header media\"><div class=\"media-left\"><div class=\"thread-item__proposal-icon\"></div></div><div class=\"media-body\"><h3 id=\"event-{{event.id}}\" class=\"thread-item__title\"><strong> <a lmo-href-for=\"event.actor()\">{{ event.actorName() }}</a> </strong><span translate=\"proposal_edited_item.{{translationKey}}\" translate-values=\"{time: closingAt, title: title}\"></span></h3></div></div><div class=\"thread-item__footer\"><div class=\"thread-item__actions\"><timeago timestamp=\"event.createdAt\"></timeago></div></div></div>");
$templateCache.put("generated/components/thread_page/activity_card/motion_outcome_created.html","<div ng-controller=\"MotionOutcomeCreatedItemController\" class=\"thread-item\"><div class=\"thread-item__header media\"><div class=\"media-left\"><user_avatar user=\"event.actor()\" size=\"small\"></user_avatar></div><div class=\"media-body\"><h3 id=\"event-{{event.id}}\" class=\"thread-item__title\"><strong> <a lmo-href-for=\"event.actor()\">{{ event.actorName() }}</a> </strong><span translate=\"proposal_outcome_created_item.proposal_outcome_created\"></span></h3></div></div><div marked=\"proposal.outcome\" class=\"thread-item__body lmo-markdown-wrapper\"></div><div class=\"thread-item__footer\"><div class=\"thread-item__actions\"><timeago timestamp=\"event.createdAt\"></timeago></div></div></div>");
$templateCache.put("generated/components/thread_page/activity_card/motion_outcome_updated.html","<div ng-controller=\"MotionOutcomeUpdatedItemController\" class=\"thread-item\"><div class=\"thread-item__header media\"><div class=\"media-left\"><user_avatar user=\"event.actor()\" size=\"small\"></user_avatar></div><div class=\"media-body\"><h3 id=\"event-{{event.id}}\" class=\"thread-item__title\"><strong> <a lmo-href-for=\"event.actor()\">{{ event.actorName() }}</a> </strong><span translate=\"proposal_outcome_updated_item.proposal_outcome_updated\"></span></h3></div></div><div marked=\"proposal.outcome\" class=\"thread-item__body lmo-markdown-wrapper\"></div><div class=\"thread-item__footer\"><div class=\"thread-item__actions\"><timeago timestamp=\"event.createdAt\"></timeago></div></div></div>");
$templateCache.put("generated/components/thread_page/activity_card/new_comment.html","<div ng_controller=\"NewCommentItemController\" id=\"comment-{{comment.id}}\" class=\"thread-item thread-item--comment\"><div uib-dropdown=\"true\" ng-if=\"showContextMenu()\" class=\"pull-right\"><button uib-dropdown-toggle=\"true\" type=\"button\" class=\"thread-item__dropdown-button lmo-btn--nude\"><i class=\"fa fa-chevron-down\"></i><div translate=\"new_comment_item.context_menu.aria_label\" class=\"sr-only\"></div></button><div class=\"uib-dropdown-menu lmo-dropdown-menu\"><ul class=\"lmo-dropdown-menu-items\"><li ng-if=\"canEditComment()\" class=\"lmo-dropdown-menu-item\"><a ng-click=\"editComment()\" translate=\"new_comment_item.context_menu.edit_comment\" class=\"lmo-dropdown-menu-item-label thread-item__edit-link\"></a></li><li ng-if=\"canDeleteComment()\" class=\"lmo-dropdown-menu-item\"><a ng-click=\"deleteComment()\" translate=\"new_comment_item.context_menu.delete_comment\" class=\"lmo-dropdown-menu-item-label thread-item__delete-link\"></a></li></ul></div></div><outlet name=\"before-comment-dropdown\" class=\"lmo-relative pull-right\"></outlet><div class=\"thread-item__header media\"><div class=\"media-left\"><user_avatar user=\"comment.author()\" size=\"small\"></user_avatar></div><div class=\"media-body\"><h3 ng-if=\"comment.parentId\" id=\"event-{{event.id}}\" class=\"new-comment__in-reply-to\"><strong> <a lmo-href-for=\"comment.author()\">{{ comment.authorName() }}</a> </strong><span translate=\"new_comment_item.in_reply_to\" translate-value-recipient=\"{{comment.parentAuthorName}}\"></span></h3><h3 ng-if=\"!comment.parentId\" class=\"new-comment__author-name\"> <a lmo-href-for=\"comment.author()\">{{ comment.authorName() }}</a> </h3><div ng-if=\"!comment.parentId\" id=\"event-{{event.id}}\" translate=\"new_comment_item.aria_label\" translate-value-author=\"{{comment.authorName()}}\" class=\"sr-only\"></div></div></div><div marked=\"comment.cookedBody()\" class=\"thread-item__body lmo-markdown-wrapper\"></div><translation ng-if=\"translation\" translation=\"translation\" field=\"body\" class=\"thread-item__body\"></translation><div class=\"thread-item__attachments\"><div ng-repeat=\"attachment in comment.attachments() | orderBy:\'createdAt\' track by attachment.id\" class=\"thread-item__attachment\"><attachment_preview attachment=\"attachment\" mode=\"thread\"></attachment_preview></div></div><div class=\"thread-item__footer\"><div ng-if=\"showCommentActions()\" class=\"thread-item__actions\"> <button type=\"button\" translate=\"common.action.like\" ng-show=\"!currentUserLikesIt()\" ng_click=\"like()\" class=\"thread-item__action thread-item__action--like\"></button>  <button type=\"button\" translate=\"common.action.unlike\" ng_click=\"unlike()\" ng-show=\"currentUserLikesIt()\" class=\"thread-item__action\"></button>  <span aria-hidden=\"true\">·</span>  <button translate=\"common.action.reply\" type=\"button\" ng_click=\"reply()\" class=\"thread-item__action thread-item__action--reply\"></button> <translate_button model=\"comment\" showdot=\"true\"></translate_button> <span aria-hidden=\"true\">·</span>  <a lmo-href-for=\"comment\"> <timeago timestamp=\"comment.createdAt\"></timeago> </a> <span ng-if=\"comment.edited()\"><span aria-hidden=\"true\">·</span> <button ng-click=\"showRevisionHistory()\" translate=\"new_comment_item.edited\" class=\"thread-item__action--view-edits\"></button> </span></div><div class=\"clearfix\"></div><outlet name=\"after-comment-event\"></outlet><div ng_show=\"anybodyLikesIt()\" class=\"thread-item__liked-by\">{{ likedBySentence }}</div></div></div>");
$templateCache.put("generated/components/thread_page/activity_card/new_motion.html","<div class=\"thread-item\"><div class=\"thread-item__header media\"><div class=\"media-left\"><user_avatar user=\"event.actor()\" size=\"small\"></user_avatar></div><div class=\"media-body\"><h3 id=\"event-{{event.id}}\" class=\"thread-item__title\"><strong> <a lmo-href-for=\"event.actor()\">{{ event.actorName() }}</a> </strong> <span translate=\"new_proposal_item.author_created_proposal\" translate-value-title=\"{{event.proposal().name}}\"></span> <timeago timestamp=\"event.createdAt\" class=\"timeago--inline\"></timeago></h3></div></div></div>");
$templateCache.put("generated/components/thread_page/activity_card/new_vote.html","<div ng-controller=\"NewVoteItemController\" class=\"thread-item\"><div class=\"thread-item__header media\"><div class=\"media-left\"><div class=\"thread-item__vote-icon thread-item__vote-icon--{{vote.position}}\"></div></div><div class=\"media-body\"><h3 ng-if=\"!vote.hasStatement()\" id=\"event-{{event.id}}\" class=\"thread-item__title\"><strong> <a lmo-href-for=\"vote.author()\">{{vote.authorName()}}</a> </strong><span translate=\"new_vote_item.{{vote.positionVerb()}}\"></span><timeago timestamp=\"vote.createdAt\" class=\"timeago--inline\"></timeago></h3><h3 ng-if=\"vote.hasStatement()\" id=\"event-{{event.id}}\" class=\"thread-item__title\"><strong> <a lmo-href-for=\"vote.author()\">{{vote.authorName()}}</a> </strong><span translate=\"new_vote_item.{{vote.positionVerb()}}_with_statement\"></span><span marked=\"vote.statement\" class=\"thread-item__vote-statement\"></span><translation ng-if=\"translation\" translation=\"translation\" field=\"statement\"></translation></h3></div><div class=\"thread-item__footer\"> <timeago timestamp=\"vote.createdAt\" class=\"timeago--inline\"></timeago> <translate_button ng-if=\"vote.hasStatement()\" model=\"vote\" showdot=\"true\"></translate_button></div></div></div>");
$templateCache.put("generated/components/thread_page/activity_card/thread_item.html","<div id=\"{{event.sequenceId}}\" ng_include=\"\'thread_page/activity_card/\'+ event.kind+ \'.html\'\" class=\"thread-item\"></div>");
$templateCache.put("generated/components/thread_page/comment/delete_comment.html","<div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h3 translate=\"delete_comment_dialog.title\" class=\"modal-title\"></h3></div><div class=\"modal-body\"><flash modal=\"true\"></flash><span translate=\"delete_comment_dialog.question\"></span></div><div class=\"modal-footer\"><button ng-click=\"submit()\" translate=\"delete_comment_dialog.confirm\" class=\"lmo-btn--danger\"></button><button ng-click=\"cancel($event)\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button></div>");
$templateCache.put("generated/components/thread_page/close_proposal_form/close_proposal_form.html","<form ng-submit=\"submit()\" ng-disabled=\"proposal.processing\" class=\"close-proposal-form\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"close_proposal_form.close_proposal\" class=\"lmo-h1\"></h1></div><div class=\"modal-body\"><span translate=\"close_proposal_form.helptext\"></span></div><div class=\"modal-footer\"><button type=\"submit\" translate=\"close_proposal_form.close_proposal_submit\" class=\"lmo-btn--submit close-proposal-form__submit-btn\"></button><button type=\"button\" ng-click=\"$close()\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button></div></form>");
$templateCache.put("generated/components/thread_page/extend_proposal_form/extend_proposal_form.html","<form ng-submit=\"submit()\" ng-disabled=\"proposal.processing\" class=\"extend-proposal-form\"><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"extend_proposal_form.title\" class=\"lmo-h1\"></h1></div><div class=\"modal-body\"><closing_at_field proposal=\"proposal\"></closing_at_field></div><div class=\"modal-footer\"><button type=\"submit\" translate=\"extend_proposal_form.submit\" class=\"lmo-btn--submit cuke-extend-proposal-btn\"></button><button type=\"button\" ng-click=\"cancel($event)\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button></div></form>");
$templateCache.put("generated/components/thread_page/previous_proposals_card/previous_proposals_card.html","<section aria-labelledby=\"previous-proposals-card-heading\" ng-show=\"anyProposals()\" class=\"previous-proposals-card\"><div class=\"lmo-card-heading-padding\"><h2 translate=\"previous_proposals_card.heading\" class=\"lmo-card-heading\" id=\"previous-proposals-card-heading\"></h2></div><proposal_accordian model=\"discussion\" selected-proposal-id=\"selectedProposalId\"></proposal_accordian></section>");
$templateCache.put("generated/components/thread_page/proposal_collapsed/proposal_collapsed.html","<a id=\"proposal-{{proposal.key}}\" class=\"proposal-collapsed\"><div class=\"sr-only\">{{proposal.name}}.<proposal_closing_time proposal=\"proposal\">.</proposal_closing_time></div><div aria-hidden=\"true\" class=\"screen-only proposal-collapsed__flex\"><pie_with_position proposal=\"proposal\"></pie_with_position><div class=\"proposal-collapsed__body\"><div class=\"proposal-collapsed__title\">{{proposal.name}}<proposal_closing_time proposal=\"proposal\" class=\"proposal-collapsed__closed-at\">.</proposal_closing_time></div><div ng-if=\"proposal.hasOutcome()\" class=\"proposal-collapsed__outcome\"> <span translate=\"proposal_collapsed.outcome\"></span> <span marked=\"proposal.outcome\"></span></div></div></div></a>");
$templateCache.put("generated/components/thread_page/position_buttons_panel/position_buttons_panel.html","<div class=\"blank\"><div ng-if=\"showPositionButtons()\" class=\"position-buttons-panel\"><h4 translate=\"position_buttons_panel.heading\" class=\"lmo-card-subheading\"></h4><div class=\"position_buttons_panel__buttons\"><button ng-click=\"select(\'yes\')\" class=\"position-button position-button--yes\"><div translate=\"vote_form.i_agree\" class=\"sr-only\"></div></button><button ng-click=\"select(\'abstain\')\" class=\"position-button position-button--abstain\"><div translate=\"vote_form.i_abstain\" class=\"sr-only\"></div></button><button ng-click=\"select(\'no\')\" class=\"position-button position-button--no\"><div translate=\"vote_form.i_disagree\" class=\"sr-only\"></div></button><button ng-click=\"select(\'block\')\" class=\"position-button position-button--block\"><div translate=\"vote_form.i_block\" class=\"sr-only\"></div></button></div><outlet name=\"after-position-buttons\"></outlet></div></div>");
$templateCache.put("generated/components/thread_page/proposal_expanded/proposal_expanded.html","<div ng-show=\"proposal\" id=\"proposal-{{proposal.key}}\" class=\"proposal-expanded\"><proposal_actions_dropdown proposal=\"proposal\" ng-if=\"showActionsDropdown()\"></proposal_actions_dropdown><a lmo-href-for=\"proposal\" class=\"proposal-expanded__proposal-name-link\"><h3 class=\"proposal-expanded__proposal-name\">{{proposal.name}}</h3><h3 ng-if=\"translation\"><translation translation=\"translation\" field=\"name\"></translation></h3></a><div class=\"proposal-expanded__started-by\"><span translate=\"proposal_expanded.started_by\" translate-values=\"{\'name\': proposal.authorName()}\"></span> <span aria-hidden=\"true\">·</span> <a lmo-href-for=\"proposal\"> <proposal_closing_time proposal=\"proposal\"></proposal_closing_time> </a><translate_button model=\"proposal\" showdot=\"true\" class=\"lmo-link-color\"></translate_button></div><div marked=\"proposal.description\" class=\"proposal-expanded-description lmo-markdown-wrapper\"></div><translation ng-if=\"translation &amp;&amp; proposal.description\" translation=\"translation\" field=\"description\"></translation><proposal_outcome_panel ng-if=\"showOutcomePanel()\" proposal=\"proposal\"></proposal_outcome_panel><translation ng-if=\"translation &amp;&amp; proposal.outcome\" translation=\"translation\" field=\"outcome\"></translation><position_buttons_panel proposal=\"proposal\"></position_buttons_panel><proposal_positions_panel proposal=\"proposal\"></proposal_positions_panel><a ng-click=\"collapse()\" translate=\"proposal_expanded.collapse\" ng-show=\"canCollapse\" class=\"proposal-expanded__collapse pull-right\"></a><div class=\"clearfix\"></div></div>");
$templateCache.put("generated/components/thread_page/proposal_outcome_form/proposal_outcome_form.html","<form ng-submit=\"submit()\" ng-disabled=\"proposal.processing\" class=\"proposal-form\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 ng-if=\"!hasOutcome\" translate=\"proposal_outcome_form.set_outcome\" class=\"lmo-h1\"></h1><h1 ng-if=\"hasOutcome\" translate=\"proposal_outcome_form.update_outcome\" class=\"lmo-h1\"></h1></div><div class=\"modal-body\"><form_errors record=\"proposal\"></form_errors><fieldset><div class=\"lmo-form-group\"><label for=\"proposal-outcome-field\" translate=\"proposal_outcome_form.outcome_label\"></label><div class=\"lmo-relative\"><textarea placeholder=\"{{ \'proposal_outcome_form.outcome_placeholder\' | translate }}\" ng-model=\"proposal.outcome\" ng-required=\"true\" class=\"lmo-textarea proposal-form__outcome-field form-control\" id=\"proposal-outcome-field\"></textarea><emoji_picker target-selector=\"outcomeSelector\" class=\"lmo-action-dock\"></emoji_picker></div></div></fieldset></div><div class=\"modal-footer\"><button type=\"submit\" translate=\"proposal_outcome_form.publish_outcome\" class=\"lmo-btn--submit proposal-outcome-form__publish-outcome-btn\"></button><button ng-click=\"$close()\" type=\"button\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel proposal-outcome-form__cancel-btn\"></button></div></form>");
$templateCache.put("generated/components/thread_page/proposal_positions_panel/proposal_positions_panel.html","<div class=\"proposal-positions-panel\"><h4 translate=\"proposal_positions_panel.heading\" class=\"lmo-card-subheading\"></h4><div class=\"proposal-pie-chart media\"><div class=\"proposal-pie-chart__pie media-left\"><pie_chart votes=\"proposal.voteCounts\" class=\"proposal-positions-panel__pie-chart\"></pie_chart></div><div class=\"proposal-pie-chart__legend media-body\"><table role=\"presentation\" id=\"proposal-current-positions\"><caption translate=\"proposal_expanded.current_votes\" class=\"sr-only\"></caption><tbody><tr ng-repeat=\"position in proposal.positions\"><td><div class=\"proposal-pie-chart__label proposal-pie-chart__label--{{position}}\">{{ proposal.voteCounts[position] }} {{ \"proposal_position_\"+position | translate}}</div></td></tr></tbody></table></div></div><div translate=\"proposal_pie_chart.participation_statement\" translate-value-percentage=\"{{proposal.percentVoted()}}\" translate-value-number=\"{{proposal.numberVoted()}}\" translate-value-total=\"{{proposal.groupSizeWhenVoting()}}\" class=\"proposal-pie-chart__participation-statement\"></div><ul class=\"proposal-positions-panel__list\"><li ng_repeat=\"vote in curatedVotes() track by vote.id\" class=\"proposal-positions-panel__vote media\"><div class=\"media-left\"><div class=\"thread-item__vote-icon thread-item__vote-icon--{{vote.position}}\"></div></div><div class=\"media-body\"><span class=\"proposal-positions-panel__name-and-position\"><strong> <a lmo-href-for=\"vote.author()\">{{vote.authorName()}}</a> </strong><span translate=\"new_vote_item.{{vote.positionVerb()}}\"></span></span><span ng-if=\"!vote.hasStatement()\">.</span><span ng-if=\"vote.hasStatement()\" class=\"proposal-positions-panel__separator\">:</span><span marked=\"vote.statement\" ng-if=\"vote.hasStatement()\" class=\"proposal-positions-panel__vote-statement\"></span><button ng-if=\"showChangeVoteOption(vote)\" ng-click=\"changeVote()\" class=\"proposal-positions-panel__change-your-vote\"> <i class=\"fa fa-exchange\"></i> <span translate=\"proposal_positions_panel.change_your_vote\"></span></button></div></li></ul><undecided_panel proposal=\"proposal\" ng-if=\"proposal.hasUndecidedMembers()\"></undecided_panel></div>");
$templateCache.put("generated/components/thread_page/proposal_outcome_panel/proposal_outcome_panel.html","<div class=\"proposal-outcome-panel\"><h4 translate=\"proposal_outcome_panel.heading\" class=\"lmo-card-subheading\"></h4><div ng-if=\"canCreateOutcome()\" class=\"lmo-wrap\"><p translate=\"proposal_outcome_panel.set_outcome_hint\" class=\"lmo-hint-text\"></p><a ng-click=\"openProposalOutcomeForm()\" translate=\"proposal_outcome_panel.set_outcome_btn\" class=\"lmo-btn--featured lmo-btn--icon proposal-outcome-panel__set-outcome-btn\"></a></div><p ng-show=\"proposal.hasOutcome()\" marked=\"proposal.outcome\" class=\"proposal-outcome-panel__outcome lmo-markdown-wrapper\"></p><button ng-if=\"canUpdateOutcome()\" ng-click=\"openProposalOutcomeForm()\" translate=\"proposal_outcome_panel.edit_outcome_link\" class=\"lmo-btn-link lmo-card-minor-action proposal-outcome-panel__edit-outcome-link\"></button></div>");
$templateCache.put("generated/components/thread_page/proposals_card/proposals_card.html","<section aria-labelledby=\"proposals-card-heading\" class=\"proposals-card\"><h2 translate=\"discussion.proposals\" class=\"lmo-card-heading\" id=\"proposals-card-heading\"></h2><div ng_repeat=\"proposal in proposalsCard.discussion.proposals() track by proposal.id\" class=\"proposals-card__proposals\"><div ng-if=\"proposalsCard.isExpanded(proposal)\" class=\"active-proposal\"><proposal_expanded proposal=\"proposal\"></proposal_expanded></div><h3 translate=\"discussion.previous_proposals\" ng-show=\"proposalsCard.discussion.proposals().length &gt; 1\"></h3><div ng-if=\"!proposalsCard.isExpanded(proposal)\" ng_click=\"proposalsCard.selectProposal(proposal)\" class=\"inactive-proposal\"><proposal_collapsed proposal=\"proposal\"></proposal_collapsed></div></div></section>");
$templateCache.put("generated/components/thread_page/revision_history_modal/revision_history_modal.html","<div class=\"revision-history-modal\"><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"{{header}}\" class=\"lmo-h1\"></h1></div><loading ng-if=\"loadExecuting\"></loading><div ng-if=\"!loadExecuting\" class=\"modal-body revision-history-modal__body\"><h2 ng-if=\"commentRevision()\" class=\"lmo-h2\">{{model.authorName()}}</h2><div ng-repeat=\"version in model.versions() | orderBy: \'-createdAt\' track by version.id\" id=\"version-{{version.id}}\" class=\"lmo-wrap\"><div class=\"revision-history-modal__revision\"><h2 ng-if=\"discussionRevision()\" translate=\"{{threadTitle(version)}}\" class=\"lmo-h2\"></h2><div class=\"revision-history-modal__thread-details\"><span ng-if=\"commentRevision()\" translate=\"revision_history_modal.posted\"></span><span ng-if=\"discussionRevision()\" translate=\"{{threadDetails(version)}}\" translate-value-name=\"{{version.authorOrEditorName()}}\"></span> <span>{{versionCreatedAt(version.createdAt)}}</span>  <span ng-if=\"version.isCurrent(version)\">(current)</span> </div><div marked=\"revisionBody(version)\" class=\"revision-history-modal__revision-body lmo-markdown-wrapper\"></div></div></div></div><div class=\"modal-footer\"><button type=\"button\" translate=\"common.action.close\" ng-click=\"$close()\" class=\"revision-history-modal__close\"></button></div></div>");
$templateCache.put("generated/components/thread_page/undecided_panel/undecided_panel.html","<div class=\"undecided-panel\"><a ng-click=\"showUndecided()\" ng-show=\"!undecidedPanelOpen\" translate=\"undecided_panel.show_undecided\" class=\"undecided-panel__show-undecided-link lmo-card-minor-action\"></a><h3 ng-show=\"undecidedPanelOpen\" translate=\"undecided_panel.aria_label\" tabindex=\"0\" class=\"undecided-panel__heading sr-only\"></h3><ul ng-if=\"undecidedPanelOpen\" class=\"undecided-panel__list\"><li ng-repeat=\"user in proposal.undecidedMembers() track by user.id\" class=\"media\"><div class=\"media-left\"><i class=\"fa fa-question-circle undecided-panel__icon\"></i></div><div class=\"media-body\"><span class=\"undecided-panel__user\">{{user.name}}</span></div></li></ul><a ng-click=\"hideUndecided()\" ng-show=\"undecidedPanelOpen\" translate=\"undecided_panel.hide_undecided\" class=\"undecided-panel__hide-undecided-link lmo-card-minor-action\"></a></div>");
$templateCache.put("generated/components/thread_page/vote_form/vote_form.html","<div class=\"vote-form\"><form ng-submit=\"submit()\" ng-disabled=\"vote.processing\" name=\"voteForm\"><div ng-show=\"isDisabled\" class=\"lmo-disabled-form\"></div><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"vote_form.heading\" class=\"lmo-h1 modal-title\"></h1></div><div class=\"modal-body\"><form_errors record=\"vote\"></form_errors><select ng-model=\"vote.position\" class=\"form-control vote-form__select-position\"><option value=\"yes\" translate=\"vote_form.i_agree\"></option><option value=\"abstain\" translate=\"vote_form.i_abstain\"></option><option value=\"no\" translate=\"vote_form.i_disagree\"></option><option value=\"block\" translate=\"vote_form.i_block\"></option></select><fieldset><div class=\"lmo-form-group\"><div class=\"lmo-relative\"><textarea ng-model=\"vote.statement\" placeholder=\"{{ \'vote_form.statement_placeholder\' | translate }}\" class=\"lmo-textarea vote-form__statement-field form-control lmo-primary-form-input\"></textarea><emoji_picker target-selector=\"statementSelector\" class=\"lmo-action-dock\"></emoji_picker></div><div ng-class=\"{ overlimit: vote.overCharLimit() }\" class=\"chars-left pull-right\">{{ vote.charsLeft() }}</div><div ng-if=\"vote.overCharLimit()\" translate=\"vote_form.statement_over_limit\" class=\"vote-form__statement-over-limit lmo-validation-error\"></div></div></fieldset></div><div class=\"modal-footer\"> <button type=\"submit\" ng-disabled=\"vote.overCharLimit()\" translate=\"vote_form.submit_position\" class=\"lmo-btn--submit vote-form__submit-btn\"></button> <button type=\"button\" ng-click=\"$close()\" translate=\"common.action.cancel\" class=\"lmo-btn--cancel\"></button></div></form></div>");
$templateCache.put("generated/components/group_page/trial_card/choose_plan_modal/choose_plan_modal.html","<div class=\"choose-plan-modal\"><div class=\"modal-header\"><modal_header_cancel_button></modal_header_cancel_button><h1 translate=\"choose_plan_modal.heading\" class=\"lmo-h1 modal-title\"></h1></div><div class=\"modal-body\"><div class=\"choose-plan-modal__pricing-table\"><div class=\"choose-plan-modal__col\"><div class=\"choose-plan-modal__option choose-plan-modal__option--gift\"><h2 translate=\"choose_plan_modal.gift\" class=\"lmo-h2\"></h2><ul class=\"choose-plan-modal__features-list\"><li><i class=\"fa fa-check\"></i>{{\"choose_plan_modal.unlimited_members\" | translate}}</li><li><i class=\"fa fa-check\"></i>{{\"choose_plan_modal.unlimited_decisions\" | translate}}</li></ul><p translate=\"choose_plan_modal.gift_body\"></p><p translate=\"choose_plan_modal.gift_donation_ask\" class=\"choose-plan-modal__gift-price\"></p><button ng-disabled=\"group.subscriptionKind == \'gift\'\" ng-click=\"chooseGiftPlan()\" translate=\"choose_plan_modal.select\" class=\"choose-plan-modal__select-button choose-plan-modal__select-button--gift\"></button></div></div><div class=\"choose-plan-modal__col\"><div class=\"choose-plan-modal__option choose-plan-modal__option--standard\"><h2 translate=\"choose_plan_modal.standard\" class=\"lmo-h2\"></h2><ul class=\"choose-plan-modal__features-list\"><li><i class=\"fa fa-check\"></i>{{\"choose_plan_modal.unlimited_members\" | translate}}</li><li><i class=\"fa fa-check\"></i>{{\"choose_plan_modal.unlimited_decisions\" | translate}}</li><li><i class=\"fa fa-check\"></i>{{\"choose_plan_modal.email_support\" | translate}}</li><li><i class=\"fa fa-check\"></i><span translate=\"choose_plan_modal.slack_integration_html\"></span></li></ul><p translate=\"choose_plan_modal.standard_price_html\" class=\"choose-plan-modal__price\"></p><button ng-click=\"choosePaidPlan(\'standard\')\" translate=\"choose_plan_modal.select\" class=\"choose-plan-modal__select-button\"></button></div></div><div class=\"choose-plan-modal__col\"><div class=\"choose-plan-modal__option\"><h2 translate=\"choose_plan_modal.plus\" class=\"lmo-h2\"></h2><p translate=\"choose_plan_modal.plus_body\"></p><ul class=\"choose-plan-modal__features-list\"><li><i class=\"fa fa-check\"></i>{{\"choose_plan_modal.multiple_groups\" | translate}}</li><li><i class=\"fa fa-check\"></i>{{\"choose_plan_modal.premium_support\" | translate}}</li><li><i class=\"fa fa-check\"></i><span translate=\"choose_plan_modal.custom_subdomain_html\"></span></li></ul><p translate=\"choose_plan_modal.plus_price_html\" class=\"choose-plan-modal__price\"></p><div class=\"choose-plan-modal__select\"><button ng-click=\"choosePaidPlan(\'plus\')\" translate=\"choose_plan_modal.select\" class=\"choose-plan-modal__select-button\"></button></div></div></div></div></div><div class=\"modal-footer lmo-clearfix\"><div class=\"row\"><div class=\"col-md-7 choose-plan-modal__support\"><img src=\"/img/mhjb.png\" alt=\"Matthew from Loomio\"><p> <span translate=\"choose_plan_modal.support_before\"></span>  <button translate=\"choose_plan_modal.support_link\" ng-click=\"openIntercom()\" class=\"choose-plan-modal__contact-link\"></button>  <span translate=\"choose_plan_modal.support_after\"></span> </p></div><div class=\"col-md-3 col-md-offset-2 choose-plan-modal__cancel\"><button type=\"button\" ng-click=\"$close()\" class=\"lmo-btn--featured\"> <i class=\"fa fa-lg fa-calendar-check-o\"></i> <span translate=\"choose_plan_modal.remind_me_later\"></span></button></div></div></div></div>");
$templateCache.put("generated/components/group_page/trial_card/confirm_gift_plan_modal/confirm_gift_plan_modal.html","<div class=\"confirm-gift-plan-modal\"><div class=\"modal-header\"><h1 translate=\"confirm_gift_plan_modal.heading\" class=\"lmo-h1 modal-title\"></h1></div><div class=\"modal-body\"><div class=\"confirm-gift-plan-modal__body\"><p translate=\"confirm_gift_plan_modal.body\"></p><label for=\"confirm-gift-plan\" class=\"confirm-gift-plan-modal__label\"><input type=\"checkbox\" ng-model=\"checked\" class=\"confirm-gift-plan-modal__checkbox\" id=\"confirm-gift-plan\"><div translate=\"confirm_gift_plan_modal.confirm_selection\" class=\"confirm-gift-plan-modal__label-text\"></div></label></div></div><div class=\"modal-footer lmo-clearfix\"><button type=\"button\" ng-disabled=\"!checked\" ng-click=\"submit()\" translate=\"confirm_gift_plan_modal.got_it\" class=\"confirm-gift-plan-modal__submit-button\"></button><button type=\"button\" ng-click=\"choosePlan()\" translate=\"confirm_gift_plan_modal.go_back\" class=\"confirm-gift-plan-modal__go-back-button\"></button></div></div>");
$templateCache.put("generated/components/group_page/trial_card/donation_modal/donation_modal.html","<div class=\"donation-modal\"><div class=\"modal-header\"><h1 translate=\"donation_modal.heading\" class=\"lmo-h1 modal-title\"></h1></div><div class=\"modal-body donation-modal__body\"><img src=\"/img/team-photo.png\" alt=\"Loomio team photo\" class=\"donation-modal__loomio-team\"><p translate=\"donation_modal.body\" class=\"donation-modal__message\"></p></div><div class=\"modal-footer lmo-clearfix\"><button type=\"button\" ng-click=\"makeDonation()\" class=\"donation-modal__confirm-button\"> <i class=\"fa fa-lg fa-gift\"></i> <span translate=\"donation_modal.contribute\"></span></button><button type=\"button\" ng-click=\"$close()\" translate=\"donation_modal.got_to_group\" class=\"donation-modal__go-to-group-button\"></button></div></div>");
$templateCache.put("generated/components/thread_page/current_proposal_card/proposal_actions_dropdown/proposal_actions_dropdown.html","<div uib-dropdown=\"true\" class=\"proposal-actions-dropdown pull-right\"><button uib-dropdown-toggle=\"true\" class=\"lmo-btn--nude proposal-actions-dropdown__btn\"><i class=\"fa fa-chevron-down\"></i></button><div role=\"menu\" class=\"uib-dropdown-menu lmo-dropdown-menu\"><ul class=\"lmo-dropdown-menu-items\"><li ng-if=\"canEditProposal()\" class=\"lmo-dropdown-menu-item\"><a ng_click=\"editProposal()\" class=\"lmo-dropdown-menu-item-label proposal-actions-dropdown__edit-link\"><span translate=\"proposal_expanded.edit_proposal\"></span></a></li><li ng-if=\"!canEditProposal() &amp;&amp; canCloseOrExtendProposal()\" class=\"lmo-dropdown-menu-item\"><a href=\"#\" ng_click=\"extendProposal()\" class=\"lmo-dropdown-menu-item-label proposal-actions-dropdown__extend-link\"><span translate=\"proposal_expanded.extend_proposal\"></span></a></li><li ng-if=\"canCloseOrExtendProposal()\" class=\"lmo-dropdown-menu-item\"><a href=\"#\" ng_click=\"closeProposal()\" class=\"lmo-dropdown-menu-item-label proposal-actions-dropdown__close-link\"><span translate=\"proposal_expanded.close_proposal\"></span></a></li></ul></div></div>");}]);