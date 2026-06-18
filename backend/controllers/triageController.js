import { pool } from "../database/db.js";
import { generateTriageAnalysis } from "../services/triageAI.js";

const generateSessionId = () => {
  return `PT-${Date.now().toString().slice(-6)}`;
};


export const submitTriageSession = async (req, res) => {
  try {
    const {
      patient_name,
      age,
      gender,
      phone,
      village,
      voice_transcript_bn,
      voice_translation_en,
      vitals,
    } = req.body;

    if (
      !patient_name ||
      !age ||
      !gender ||
      !voice_transcript_bn ||
      !vitals
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields.",
      });
    }

    const aiAnalysis = await generateTriageAnalysis({
      age,
      gender,
      transcript: voice_translation_en,
      vitals,
    });

    const sessionId = generateSessionId();

    await pool.query(
      `
      INSERT INTO triage_sessions (
        session_id,
        assigned_worker_id,
        patient_name,
        age,
        gender,
        phone_number,
        village_ward,
        systolic_bp,
        diastolic_bp,
        heart_rate,
        spo2_level,
        temperature_f,
        transcript_bn,
        translation_en,
        triage_level,
        status_label,
        ai_diagnosis_json,
        ai_first_aid
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        sessionId,
        req.userId,
        patient_name,
        age,
        gender,
        phone,
        village,

        vitals.systolic_bp,
        vitals.diastolic_bp,
        vitals.heart_rate,
        vitals.spo2,
        vitals.temperature_f,

        voice_transcript_bn,
        voice_translation_en,

        aiAnalysis.triage_category.toLowerCase(),
        aiAnalysis.status_label,

        JSON.stringify(aiAnalysis.differential_diagnosis),
        aiAnalysis.first_aid_protocol,
      ]
    );

    return res.status(201).json({
      success: true,
      session_id: sessionId,
      ai_analysis: aiAnalysis,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTriageSessions = async (req, res) => {
  try {
    const { status = "active" } = req.query;

    const isArchived = status === "archived";

    const [records] = await pool.query(
      `
      SELECT
        session_id,
        patient_name,
        age,
        gender,
        translation_en,
        triage_level,
        status_label,
        created_at
      FROM triage_sessions
      WHERE is_archived = ?
      ORDER BY created_at DESC
      `,
      [isArchived]
    );

    const [summary] = await pool.query(
      `
      SELECT
        COUNT(*) AS processed_cases_count,
        SUM(CASE WHEN triage_level = 'red' THEN 1 ELSE 0 END)
          AS critical_red_count
      FROM triage_sessions
      WHERE is_archived = ?
      `,
      [isArchived]
    );

    return res.status(200).json({
      success: true,
      shift_summary_kpis: {
        processed_cases_count:
          summary[0].processed_cases_count || 0,
        critical_red_count:
          summary[0].critical_red_count || 0,
      },
      records: records.map((record) => ({
        id: record.session_id,
        name: record.patient_name,
        meta: `${record.age} yrs / ${record.gender.toLowerCase()}`,
        condition: record.translation_en?.substring(0, 100) || "",
        level: record.triage_level,
        status: record.status_label,
        date: record.created_at.toISOString().split("T")[0],
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

