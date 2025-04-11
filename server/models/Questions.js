module.exports = (sequelize, DataTypes) => {

    const Questions = sequelize.define("Questions", {

        questionText: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        QuizId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        

    });

    Questions.associate = (models) => {
        Questions.hasMany(models.Options, {
            onDelete: "cascade",
        });
    };
  

    return Questions;
};