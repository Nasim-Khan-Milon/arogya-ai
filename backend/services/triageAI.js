export const generateTriageAnalysis = async ({
  vitals,
}) => {
  let triage_category = "green";
  let status_label = "Stable";

  const diagnoses = [];
  let first_aid_protocol =
    "Provide basic observation and hydration.";

  if (
    vitals.spo2 < 90 ||
    vitals.temperature_f >= 103
  ) {
    triage_category = "red";
    status_label = "Critical";

    diagnoses.push(
      "Acute respiratory distress",
      "Severe hypoxia risk"
    );

    first_aid_protocol =
      "Provide high-flow oxygen support immediately.";
  } else if (
    vitals.temperature_f >= 101 ||
    vitals.systolic_bp > 140
  ) {
    triage_category = "yellow";
    status_label = "Needs Attention";

    diagnoses.push(
      "Possible infection",
      "Hypertension risk"
    );

    first_aid_protocol =
      "Monitor vital signs and refer to a physician.";
  }

  return {
    triage_category: triage_category.toUpperCase(),
    status_label,
    differential_diagnosis: diagnoses,
    first_aid_protocol,
  };
};

