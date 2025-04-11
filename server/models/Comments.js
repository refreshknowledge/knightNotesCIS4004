module.exports = (sequelize, DataTypes) => {

    const Comments = sequelize.define("Comments", {

        commentText: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        QuizId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        

    });

  

    return Comments;
};