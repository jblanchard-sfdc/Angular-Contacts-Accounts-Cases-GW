/**
 * Configure all the AngularJS routes here...
 */
app.config(function ($routeProvider) {
    $routeProvider.
        when('/', {controller: 'HomeCtrl', templateUrl: 'partials/home.html'}).
        when('/login', {controller: 'LoginCtrl', templateUrl: 'partials/login.html'}).
        when('/logout', {controller: 'LoginCtrl', templateUrl: 'partials/logout.html'}).        
        when('/callback', {controller: 'CallbackCtrl', templateUrl: 'partials/callback.html'}).
        when('/contacts', {controller: 'ContactListCtrl', templateUrl: 'partials/contact/list.html'}).
        when('/view/:contactId', {controller: 'ContactViewCtrl', templateUrl: 'partials/contact/view.html'}).
        when('/edit/:contactId', {controller: 'ContactDetailCtrl', templateUrl: 'partials/contact/edit.html'}).
        when('/new', {controller: 'ContactDetailCtrl', templateUrl: 'partials/contact/edit.html'}).
        when('/accounts', {controller: 'AccountListCtrl', templateUrl: 'partials/account/list.html'}).  
        when('/accountsView/:accountId', {controller: 'AccountViewCtrl', templateUrl: 'partials/account/view.html'}).
        when('/accountsEdit/:accountId', {controller: 'AccountDetailCtrl', templateUrl: 'partials/account/edit.html'}).
        when('/cases', {controller: 'CaseListCtrl', templateUrl: 'partials/case/list.html'}). 
        when('/casesView/:caseId', {controller: 'CaseViewCtrl', templateUrl: 'partials/case/view.html'}).
        when('/casesEdit/:caseId', {controller: 'CaseDetailCtrl', templateUrl: 'partials/case/edit.html'}).
        otherwise({redirectTo: '/'});
});

/**
* Ensure the "tel" URL is acceptable.
*/
app.config(function($compileProvider){
    $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
});

/**
 * Describe Salesforce object to be used in the app. For example: Below AngularJS factory shows how to describe and
 * create an 'Contact' object. And then set its type, fields, where-clause etc.
 *
 *  PS: This module is injected into ListCtrl, EditCtrl etc. controllers to further consume the object.
 */
angular.module('Contact', []).factory('Contact', function (AngularForceObjectFactory) {
    var Contact = AngularForceObjectFactory({type: 'Contact', fields: ['FirstName', 'LastName', 'Title', 'Phone', 'Email', 'Id'], where: '', limit: 10});
    return Contact;
});

angular.module('Account', []).factory('Account', function (AngularForceObjectFactory) {
    var Account = AngularForceObjectFactory({type: 'Account', fields: ['Id', 'Name', 'AccountNumber', 'BillingCity'], where: '', limit: 20});
    return Account;
});

angular.module('Case', []).factory('Case', function (AngularForceObjectFactory) {
    var Case = AngularForceObjectFactory({type: 'Case', fields: ['Id', 'CaseNumber', 'Subject', 'Type', 'Status'], where: '', limit: 10});
    return Case;
});


/** 
* Contact Related Controllers
*/
app.controller('HomeCtrl', ['$scope', 'AngularForce', '$location', '$route', 
    function($scope, AngularForce, $location, $route) {
    //If in visualforce, directly login
        if (AngularForce.inVisualforce) {
            $location.path('/login');
        } else if (AngularForce.refreshToken) { //If web, try to relogin using refresh-token
            console.log('in refreshToken');
            AngularForce.login(function () {
                //$location.path('/contacts/');
                //$scope.$apply();//Required coz sfdc uses jquery.ajax
            });
        } else {
            console.log('in else');
            $location.path('/login');
        }      

        $scope.doLogout = function () {
            console.log('should be logging out');
            AngularForce.logout(function () {
                //Now go to logout page
                $location.path('/logout');
                $scope.$apply();
            });
        };  
      
    }
]);

app.controller('LoginCtrl', ['$scope', 'AngularForce', '$location', 
    function($scope, AngularForce, $location) {
        $scope.login = function () {
            AngularForce.login();
        };

        //If in visualforce, directly login
        if (AngularForce.inVisualforce) {
            AngularForce.login();
        }

        $scope.isLoggedIn = function () {
            return AngularForce.authenticated();
        };

    }
]);

app.controller('CallbackCtrl', ['$scope', 'AngularForce', '$location', 
    function($scope, AngularForce, $location) {
        AngularForce.oauthCallback(document.location.href);
        $location.path('/home');
    }
]);

app.controller('ContactListCtrl', ['$scope', 'AngularForce', '$location', 'Contact',
    function($scope, AngularForce, $location, Contact) {
        $scope.authenticated = AngularForce.authenticated();
        if (!$scope.authenticated) {
            return $location.path('/login');
        }

        $scope.doSearch = function (searchTerm) {
            $scope.contacts = [];
            Contact.searchCustom(
                'Find {' + escape($scope.searchTerm) + '*} IN ALL FIELDS RETURNING CONTACT (Id, FirstName, LastName, Title, Email, Phone, Account.Name)',
                function (data) {
                    $scope.contacts = data;
                    $scope.$apply();//Required coz sfdc uses jquery.ajax
                }, 
                function (data) {
                    console.log(data);
                    alert("Search Error");
                }
            );

        };

        $scope.doList = function() {
            $scope.searchTerm = '';
            Contact.query(function (data) {
                    $scope.contacts = data.records;
                    $scope.$apply();//Required coz sfdc uses jquery.ajax
                }, function (data) {
                    alert('Query Error');
                }, 'Select Id, FirstName, LastName, Title, Email, Phone, Account.Name From Contact Order By LastName Limit 20 ');            
        }

        $scope.doView = function (contactId) {
            $location.path('/view/' + contactId);
        };

        $scope.doCreate = function () {
            $location.path('/new');
        };

        $scope.searchTerm = '';
        $scope.doList();        
    }
]);

app.controller('AccountListCtrl', ['$scope', 'AngularForce', '$location', 'Account', 
    function($scope, AngularForce, $location, Account) {
        $scope.authenticated = AngularForce.authenticated();
        if (!$scope.authenticated) {
            return $location.path('/login');
        }

            
    	$scope.doList = function() {
            $scope.searchTerm = '';
            Account.query(function (data) {
                    $scope.accounts = data.records;
                    $scope.$apply();//Required coz sfdc uses jquery.ajax
                }, function (data) {
                    alert('Query Error');
                }, 'Select Id, Name, AccountNumber, BillingCity From Account Limit 20 ');            
        }

        $scope.doView = function() {
             $location.path('/accountsView/' + accountId);
        }
        
        $scope.doList();       
    }
]);

app.controller('CaseListCtrl', ['$scope', 'AngularForce', '$location', 'Case', 
    function($scope, AngularForce, $location, Case) {
        $scope.authenticated = AngularForce.authenticated();
        if (!$scope.authenticated) {
            return $location.path('/login');
        }
        
        $scope.doList = function() {
            $scope.searchTerm = '';
        	Case.query(function (data) {
                $scope.cases = data.records;
                $scope.$apply();//Required coz sfdc uses jquery.ajax
            }, function (data) {
                alert('Query Error');
                }, 'Select Id, CaseNumber, Subject, Type, Status From Case Limit 20');            
        }

        $scope.doView = function(caseId) {
             $location.path('/casesView/' + caseId);
        }
        
        $scope.doList();        
    }
]);

app.controller('ContactViewCtrl', ['$scope', 'AngularForce', '$location', '$routeParams', 'Contact', 
    function($scope, AngularForce, $location, $routeParams, Contact) {
        $scope.authenticated = AngularForce.authenticated();
        if (!$scope.authenticated) {
            return $location.path('/login');
        }

        Contact.get({id: $routeParams.contactId}, function (contact) {
            
            self.original = contact;
            $scope.contact = new Contact(self.original);
            $scope.$apply();//Required coz sfdc uses jquery.ajax
        });
    }
]);

app.controller('AccountViewCtrl', ['$scope', 'AngularForce', '$location', '$routeParams', 'Account', 
    function($scope, AngularForce, $location, $routeParams, Account) {
        $scope.authenticated = AngularForce.authenticated();
        if (!$scope.authenticated) {
            return $location.path('/login');
        }

        Account.get({id: $routeParams.accountId}, function (account) {
            
            self.original = account;
            $scope.account = new Account(self.original);
            $scope.$apply();//Required coz sfdc uses jquery.ajax
        });
    }
]);

app.controller('CaseViewCtrl', ['$scope', 'AngularForce', '$location', '$routeParams', 'Case', 
    function($scope, AngularForce, $location, $routeParams, Case) {
        $scope.authenticated = AngularForce.authenticated();
        if (!$scope.authenticated) {
            return $location.path('/login');
        }

        Case.get({id: $routeParams.caseId}, function (sfcase) {
            
            self.original = sfcase;
            $scope.case = new Case(self.original);
            $scope.$apply();//Required coz sfdc uses jquery.ajax
        });
    }
]);

app.controller('ContactDetailCtrl', ['$scope', 'AngularForce', '$location', '$routeParams', 'Contact', 
    function($scope, AngularForce, $location, $routeParams, Contact) {
        var self = this;

        $scope.destroyError = null;

        if ($routeParams.contactId) {
            AngularForce.login(function () {
                Contact.get({id: $routeParams.contactId}, function (contact) {
                    self.original = contact;
                    $scope.contact = new Contact(self.original);
                    $scope.$apply();//Required coz sfdc uses jquery.ajax
                });
            });
        } else {
            $scope.contact = new Contact();
            //$scope.$apply();
        }

        $scope.isClean = function () {
            return angular.equals(self.original, $scope.contact);
        };

        $scope.destroy = function () {
            self.original.destroy(
                function () {
                    $scope.$apply(function () {
                        $scope.destroyError = null;
                        $location.path('/contacts');
                    });
                },
                function (data) {
                    if (data.responseText) {
                        var res = angular.fromJson(data.responseText);
                    }
                    $scope.$apply(function() { $scope.destroyError = res[0].message });
                    console.log('delete error');

                }
            );
        };

        $scope.save = function () {
            if ($scope.contact.Id) {
                $scope.contact.update(function () {
                    $scope.$apply(function () {
                        $location.path('/view/' + $scope.contact.Id);
                    });

                });
            } else {
                Contact.save($scope.contact, function (contact) {
                    var c = contact;
                    $scope.$apply(function () {
                        $location.path('/view/' + c.Id || c.id);
                    });
                });
            }
        };

        $scope.doCancel = function () {
            if ($scope.contact.Id) {
                $location.path('/view/' + $scope.contact.Id);
            } else {
                $location.path('/contacts');
            }
        };


    }
]);

app.controller('AccountDetailCtrl', ['$scope', 'AngularForce', '$location', '$routeParams', 'Account', 
    function($scope, AngularForce, $location, $routeParams, Account) {
        var self = this;

        $scope.destroyError = null;

        if ($routeParams.accountId) {
            AngularForce.login(function () {
                Account.get({id: $routeParams.accountId}, function (account) {
                    self.original = account;
                    $scope.account = new Account(self.original);
                    $scope.$apply();//Required coz sfdc uses jquery.ajax
                });
            });
        } else {
            $scope.account = new Account();
        }

        $scope.isClean = function () {
            return angular.equals(self.original, $scope.account);
        };

        $scope.destroy = function () {
            self.original.destroy(
                function () {
                    $scope.$apply(function () {
                        $scope.destroyError = null;
                        $location.path('/accounts');
                    });
                },
                function (data) {
                    if (data.responseText) {
                        var res = angular.fromJson(data.responseText);
                    }
                    $scope.$apply(function() { $scope.destroyError = res[0].message });
                    console.log('delete error');

                }
            );
        };

        $scope.save = function () {
            if ($scope.account.Id) {
                $scope.account.update(function () {
                    $scope.$apply(function () {
                        $location.path('/accountsView/' + $scope.account.Id);
                    });

                });
            } else {
                Account.save($scope.account, function (account) {
                    var a = account;
                    $scope.$apply(function () {
                        $location.path('/accountsView/' + a.Id || a.id);
                    });
                });
            }
        };

        $scope.doCancel = function () {
            if ($scope.account.Id) {
                $location.path('/accountsView/' + $scope.account.Id);
            } else {
                $location.path('/accounts');
            }
        };


    }
]);

app.controller('CaseDetailCtrl', ['$scope', 'AngularForce', '$location', '$routeParams', 'Case', 
    function($scope, AngularForce, $location, $routeParams, Case) {
        var self = this;

        $scope.destroyError = null;

        if ($routeParams.caseId) {
            AngularForce.login(function () {
                Case.get({id: $routeParams.caseId}, function (sfcase) {
                    self.original = sfcase;
                    $scope.case = new Case(self.original);
                    $scope.$apply();//Required coz sfdc uses jquery.ajax
                });
            });
        } else {
            $scope.case = new Case();
        }

        $scope.isClean = function () {
            return angular.equals(self.original, $scope.case);
        };

        $scope.destroy = function () {
            self.original.destroy(
                function () {
                    $scope.$apply(function () {
                        $scope.destroyError = null;
                        $location.path('/cases');
                    });
                },
                function (data) {
                    if (data.responseText) {
                        var res = angular.fromJson(data.responseText);
                    }
                    $scope.$apply(function() { $scope.destroyError = res[0].message });
                    console.log('delete error');

                }
            );
        };

        $scope.save = function () {
            if ($scope.case.Id) {
                $scope.case.update(function () {
                    $scope.$apply(function () {
                        $location.path('/casesView/' + $scope.case.Id);
                    });

                });
            } else {
                Case.save($scope.case, function (sfcase) {
                    var c = sfcase;
                    $scope.$apply(function () {
                        $location.path('/casesView/' + c.Id || c.id);
                    });
                });
            }
        };

        $scope.doCancel = function () {
            if ($scope.case.Id) {
                $location.path('/casesView/' + $scope.case.Id);
            } else {
                $location.path('/cases');
            }
        };


    }
]);




