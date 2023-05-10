import React from "react";

const WeatherDetail = ({ label, value }) => {
    return (
        <li>
            <h3>{label}</h3>
            <span>{value}</span>
        </li>
    );
};

export default WeatherDetail;
