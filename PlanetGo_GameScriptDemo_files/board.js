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
                var selectedPoint = $scope.Board.GetPoint(x, y);
                if (selectedPoint.Group != null)
                    return;

                var color = $scope.Board.NextToPlay;
                var neighbors = selectedPoint.GetNeighbors();

                var neighboringGroupsOfOppositeColor = [];
                for (var n = 0; n < neighbors.length; n++) {
                    var neighbor = neighbors[n];
                    if (neighbor.Group && neighbor.Group.Color != color)
                        neighboringGroupsOfOppositeColor.push(neighbor.Group);
                }
                neighboringGroupsOfOppositeColor = neighboringGroupsOfOppositeColor.unique();

                var isMoveLegal = false;
                for (var d = 0; d < neighboringGroupsOfOppositeColor.length; d++) {
                    if (neighboringGroupsOfOppositeColor[d].GetLiberties() <= 1)
                        isMoveLegal = true;
                }

                var neighboringGroupsOfSameColor = [];
                for (var n = 0; n < neighbors.length; n++) {
                    var neighbor = neighbors[n];
                    if (neighbor.Group && neighbor.Group.Color == color)
                        neighboringGroupsOfSameColor.push(neighbor.Group);
                }
                neighboringGroupsOfSameColor = neighboringGroupsOfSameColor.unique();

                var newGroup = new Group(color);
                newGroup.AddStone(selectedPoint);

                neighboringGroupsOfSameColor.push(newGroup);
                newGroup = $scope.Board.GetConnectedGroup(neighboringGroupsOfSameColor);
                isMoveLegal = isMoveLegal || (newGroup.GetLiberties() > 0);

                if (!isMoveLegal)
                    return;

                $scope.Board.AddGroup(newGroup);
                for (var r = 0; r < neighboringGroupsOfOppositeColor.length; r++) {
                    var groupToCheckRemove = neighboringGroupsOfOppositeColor[r];
                    if (groupToCheckRemove.GetLiberties() < 1)
                        $scope.Board.RemoveGroup(groupToCheckRemove);
                };

                if (color == 'black') {
                    $scope.Board.NextToPlay = 'white';
                }
                else {
                    $scope.Board.NextToPlay = 'black';
                }
            };

        }],
        //templateUrl: '/templates/board.html'
        template: "<table class='goban playable' cellspacing='0'><tbody><tr ng-repeat='y in GetIndices() track by $index'><td ng-repeat='x in GetIndices() track by $index'><board-point point='Board.GetPoint($index, size - 1 - $parent.$index)' ng-click='MakeMove($index, size - 1 - $parent.$index)'></board-point></td></tr></tbody></table>"
    };
});

