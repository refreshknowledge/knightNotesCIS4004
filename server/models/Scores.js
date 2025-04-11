module.exports = (sequelize, DataTypes) => {

    const Scores = sequelize.define("Scores", {

        QuizId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ScorePercentage: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        

    });

  

    return Scores;
};