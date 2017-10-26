function Point(x, y, board) {
    if (!(this instanceof Point)) {
        return new Point(x, y, board);
    }
    this.Board = board;
    this.X = x;
    this.Y = y;
    this.Group = null;
    this.NeighborN = null;
    this.NeighborE = null;
    this.NeighborS = null;
    this.NeighborW = null;
};

Point.prototype.GetNeighbors = function () {
    return [this.NeighborN, this.NeighborE, this.NeighborS, this.NeighborW].filter(function (val) { return val !== null; });
}

Point.prototype.Equals = function (otherPoint) {
    return this.X === otherPoint.X && this.Y === otherPoint.Y;
}

Point.prototype.toString = function () {
    return "(" + this.X + "," + this.Y + ")";
}

function Group(color) {
    if (!(this instanceof Group)) {
        return new Group(color);
    }
    this.Color = color;
    this.Stones = [];
    this.NeighboringPoints = [];
    this.Board = null;
};

Group.prototype.toString = function () {
    return this.Color + ' group with ' + this.GetLiberties() + ' liberties: ' + this.Stones.join('-');
}

Group.prototype.AddStone = function (point, assignToGroup) {
    var compareToPoint = function (p) {
        return function (val) {
            return val.X === p.X && val.Y === p.Y;
        };
    };
    if (this.Stones.some(compareToPoint(point))) {
        return false;
    }
    this.Stones.push(point);
    if (assignToGroup) {
        point.Group = this;
    }
    var neighborToRemove = this.NeighboringPoints.find(compareToPoint(point));
    if (neighborToRemove) {
        this.NeighboringPoints.splice(this.NeighboringPoints.indexOf(neighborToRemove), 1);
    }
    var neighborsToAdd = point.GetNeighbors().filter(function (val) {
        return !(this.Stones.some(compareToPoint(val))) || (this.NeighboringPoints.some(compareToPoint(val)));
    }, this);
    if (neighborsToAdd.length > 0) {
        this.NeighboringPoints = this.NeighboringPoints.concat(neighborsToAdd);
    }
    return true;
}

Group.prototype.GetLiberties = function () {
    return this.NeighboringPoints.filter(function (point) { return point.Group === null; }).length || 0;
}

function Board(size) {
    if (!(this instanceof Board)) {
        return new Board(size);
    }
    this.Size = size;
    this.IsSizeOdd = (size % 2) == 1;
    this.IsSizeLarge = size >= 13;
    this.Groups = [];
    this.Points = new Array(size);
    for (let i = 0; i < size; i++) {
        let line = new Array(size);
        let previousLine = this.Points[i - 1];
        for (let j = 0; j < size; j++) {
            let currentPoint = new Point(i + 1, j + 1, this);
            if (j > 0) {
                let neighborW = line[j - 1];
                neighborW.NeighborE = currentPoint;
                currentPoint.NeighborW = neighborW;
            };
            if (i > 0) {
                let neighborN = previousLine[j];
                neighborN.NeighborS = currentPoint;
                currentPoint.NeighborN = neighborN;
            };
            line[j] = currentPoint;
        }
        this.Points[i] = line;
    }
};

Board.prototype.GetPoint = function (x, y) {
    return this.Points[x][y];
}

Board.prototype.AddGroup = function (group) {
    this.Groups.push(group);
    group.Stones.forEach(function (stone) {
        stone.Group = group;
    });
    group.Board = this;
};

Board.prototype.RemoveGroup = function (group) {
    var index = this.Groups.indexOf(group);
    if (index > -1) {
        this.Groups.splice(index, 1);
        group.Board = null;
        group.Stones.forEach(function (stone) {
            stone.Group = null;
        });
    }
}

Board.prototype.GetConnectedGroup = function (groups) {
    var stones = [];
    groups.forEach(function (group) {
        stones = stones.concat(group.Stones);
    });
    stones = stones.unique();
    var connectedGroup = new Group(groups[0].Color);
    stones.forEach(function (stone) {
        connectedGroup.AddStone(stone, false);
    });
    return connectedGroup;
};

Array.prototype.contains = function (v) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === v)
            return true;
    }
    return false;
};

Array.prototype.unique = function () {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        if (!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr;
}
