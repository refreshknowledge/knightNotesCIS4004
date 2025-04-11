module.exports = (sequelize, DataTypes) => {

    const Options = sequelize.define("Options", {

        optionText: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        answer: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        QuestionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        

    });

  

    return Options;
};