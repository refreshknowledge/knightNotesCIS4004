module.exports = (sequelize, DataTypes) => {

    const Users = sequelize.define("Users", {

        
        user: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },

    });

    

    Users.associate = (models) => {
        Users.hasMany(models.Likes, {
            onDelete: "cascade",
        });

        Users.hasMany(models.Quizzes, {
            onDelete: "cascade",
        });

        Users.hasMany(models.Scores, {
            onDelete: "cascade",
        });
    };



    
    return Users;
};