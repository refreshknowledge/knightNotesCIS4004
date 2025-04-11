module.exports = (sequelize, DataTypes) => {

    const Quizzes = sequelize.define("Quizzes", {

        
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        question: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        

    });

    

    Quizzes.associate = (models) => {
        
        Quizzes.hasMany(models.Comments, {
            onDelete: "cascade",
        });

        
        Quizzes.hasMany(models.Likes, {
            onDelete: 'CASCADE',
        });

        
        Quizzes.hasMany(models.Questions, {
            onDelete: "cascade",
        });

        Quizzes.hasMany(models.Scores, {
            onDelete: "cascade",
        });
    };


    return Quizzes;
};