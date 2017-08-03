function Point(x, y, board) {
    var thisPoint = this;
    thisPoint.Board = board;
    thisPoint.X = x;
    thisPoint.Y = y;
    thisPoint.Group = null;
    thisPoint.NeighborN = null;
    thisPoint.NeighborE = null;
    thisPoint.NeighborS = null;
    thisPoint.NeighborW = null;
    thisPoint.GetNeighbors = function () {
        let neighbors = [];
        if (thisPoint.NeighborN != null)
            neighbors.push(thisPoint.NeighborN);
        if (thisPoint.NeighborE != null)
            neighbors.push(thisPoint.NeighborE);
        if (thisPoint.NeighborS != null)
            neighbors.push(thisPoint.NeighborS);
        if (thisPoint.NeighborW != null)
            neighbors.push(thisPoint.NeighborW);
        return neighbors;
    }
};

function Group(color) {
    var thisGroup = this;
    thisGroup.Color = color;
    thisGroup.Stones = [];
    thisGroup.NeighboringPoints = [];
	thisGroup.Contains = function (point) {
		for (let s = 0; s < thisGroup.Stones.length; s++)
        {
            let stone = thisGroup.Stones[s];
            if (stone.X == point.X && stone.Y == point.Y)
                return true;
        }
	};
	thisGroup.AddStone = function (point) {
        if (thisGroup.Contains(point))
			return false;
			
        thisGroup.Stones.push(point);
        var neighbors = point.GetNeighbors();
        var neighborsToAdd = [];
        for (let n = 0; n < neighbors.length; n++)
        {
            let neighbor = neighbors[n];
            let alreadyThere = thisGroup.Contains(neighbor);
			if (alreadyThere)
				continue;
				
            for (let l = 0; l < thisGroup.NeighboringPoints.length; l++)            
            {
                let liberty = thisGroup.NeighboringPoints[l];
                if (neighbor.X == liberty.X && neighbor.Y == liberty.Y)
                    alreadyThere = true;
            }
            if (alreadyThere)
				continue;
				
			neighborsToAdd.push(neighbor);
        }
		
		var indexToRemove = null;
		for (let l = 0; l < thisGroup.NeighboringPoints.length; l++)  
		{
			let liberty = thisGroup.NeighboringPoints[l];
            if (point.X == liberty.X && point.Y == liberty.Y){
				indexToRemove = l;
				break;
			}			               
        }		
		
        for (let a = 0; a < neighborsToAdd.length; a++)
            thisGroup.NeighboringPoints.push(neighborsToAdd[a]);
		
		if (indexToRemove)
			thisGroup.NeighboringPoints.splice(indexToRemove,1);

        return true;
    }
    thisGroup.GetLiberties = function () {
        let liberties = 0;
        for (var n = 0; n < thisGroup.NeighboringPoints.length; n++)
        {
            let point = thisGroup.NeighboringPoints[n];
            if (point.Group == null)
                liberties = liberties + 1;
        }
        return liberties;
    }
};

function Board(size) {

    var thisBoard = this;

    thisBoard.Size = size;

    thisBoard.IsSizeOdd = (size % 2) == 1;

    thisBoard.IsSizeLarge = size >= 13;

    var points = new Array(size);
    for (var i = 0; i < size; i++) {
        var line = new Array(size);
        var previousLine = points[i - 1];
        for (var j = 0; j < size; j++) {
            var thisPoint = new Point(i + 1, j + 1, thisBoard);
            if (j > 0) {
                var neighborW = line[j - 1];
                neighborW.NeighborE = thisPoint;
                thisPoint.NeighborW = neighborW;
            };
            if (i > 0) {
                var neighborN = previousLine[j];
                neighborN.NeighborS = thisPoint;
                thisPoint.NeighborN = neighborN;
            };
            line[j] = thisPoint;
        }
        points[i] = line;
    }

    thisBoard.Points = points;

    thisBoard.GetPoint = function (x, y) {
        return thisBoard.Points[x][y];
    }

    thisBoard.Groups = [];

    thisBoard.AddGroup = function (group) {
        thisBoard.Groups.push(group);
        for (var s = 0; s < group.Stones.length; s++) {
            let stone = group.Stones[s];
            stone.Group = group;
        };
    };

    thisBoard.RemoveGroup = function (group) {
        var index = thisBoard.Groups.indexOf(group);
        if (index > -1) {
            thisBoard.Groups.splice(index, 1);
            for (var s = 0; s < group.Stones.length; s++) {
                let stone = group.Stones[s];
                stone.Group = null;
            };
        }
    }

    thisBoard.GetConnectedGroup = function (groups) {
        var stones = [];
        for (var g = 0; g < groups.length; g++) {
            var group = groups[g];
            for (var s = 0; s < group.Stones.length; s++)
                stones.push(group.Stones[s]);
        };
        stones = stones.unique();
        var connectedGroup = new Group(groups[0].Color);
        for (var i = 0; i < stones.length; i++)
            connectedGroup.AddStone(stones[i]);

        return connectedGroup;
    };
};

Array.prototype.contains = function (v) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === v) return true;
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