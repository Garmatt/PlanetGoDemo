angular.module('gameEngine').directive('board', function () {
    return {
        restrict: 'E',
        scope: {
            size: '='
        },
        link: function (scope) {

            scope.Board = new Board(scope.size);

            scope.Board.NextToPlay = 'black';

            scope.GetIndices = function () {
                return new Array(scope.size);
            };

        },
        controller: ['$scope', function BoardController($scope) {
            $scope.MakeMove = function (x, y) {
                console.log('-------------');
                var selectedPoint = $scope.Board.GetPoint(x, y);
                if (selectedPoint.Group) {
                    return;
                }
                var color = $scope.Board.NextToPlay;
                console.log('Playing ' + selectedPoint + ' ' + color);
                var neighbors = selectedPoint.GetNeighbors();
                var neighboringGroupsOfOppositeColor = neighbors.filter(function (neighbor) {
                    return neighbor.Group && neighbor.Group.Color !== color;
                }).map(function (neighbor) {
                    return neighbor.Group;
                    }).unique();
                console.log('Neighboring groups of opposite color: ' + neighboringGroupsOfOppositeColor.join('; '));
                var isMoveLegal = neighboringGroupsOfOppositeColor.some(function (group) { return group.GetLiberties() <= 1; });
                var newGroup = new Group(color);
                newGroup.AddStone(selectedPoint, true);
                console.log('New group: ' + newGroup);
                var neighboringGroupsOfSameColor = neighbors.filter(function (neighbor) {
                    return neighbor.Group && neighbor.Group.Color === color;
                }).map(function (neighbor) {
                    return neighbor.Group;
                }).unique();
                console.log('Neighboring groups of same color: ' + neighboringGroupsOfSameColor.join('; '));
                neighboringGroupsOfSameColor.push(newGroup);
                var connectedGroup = $scope.Board.GetConnectedGroup(neighboringGroupsOfSameColor);
                console.log('Connected group: ' + connectedGroup);
                isMoveLegal = isMoveLegal || (connectedGroup.GetLiberties() > 0);
                if (!isMoveLegal) {
                    selectedPoint.Group = null;
                    return;
                }
                neighboringGroupsOfSameColor.forEach(function (groupToRemove) {
                    $scope.Board.RemoveGroup(groupToRemove);
                });
                $scope.Board.AddGroup(connectedGroup);
                console.log('Added group: ' + connectedGroup);
                neighboringGroupsOfOppositeColor.forEach(function (groupToCheckRemove) {
                    if (groupToCheckRemove.GetLiberties() < 1) {
                        $scope.Board.RemoveGroup(groupToCheckRemove);
                    }
                });
                if (color === 'black') {
                    $scope.Board.NextToPlay = 'white';
                }
                else {
                    $scope.Board.NextToPlay = 'black';
                }
                console.log(' ');
            };
        }],
        //templateUrl: '/templates/board.html'
        template: "<table class='goban playable' cellspacing='0'><tbody><tr ng-repeat='y in GetIndices() track by $index'><td ng-repeat='x in GetIndices() track by $index'><board-point point='Board.GetPoint($index, size - 1 - $parent.$index)' ng-click='MakeMove($index, size - 1 - $parent.$index)'></board-point></td></tr></tbody></table>"
    };
});

