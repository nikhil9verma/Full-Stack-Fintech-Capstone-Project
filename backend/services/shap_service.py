"""Shared SHAP explainer utilities"""
import shap
import numpy as np
import pandas as pd
from typing import Any, List, Dict


def get_top_factors(
    model: Any,
    data: pd.DataFrame,
    feature_names: List[str],
    n: int = 5,
) -> List[Dict[str, float]]:
    """Return top-N SHAP factors sorted by absolute impact."""
    try:
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(data)

        # Handle binary classifiers that return list of arrays
        if isinstance(shap_values, list):
            shap_values = shap_values[1]

        # Take first row if multiple rows
        row = shap_values[0] if shap_values.ndim > 1 else shap_values

        factors = [
            {"feature": feature_names[i], "value": float(row[i])}
            for i in range(len(feature_names))
        ]
        factors.sort(key=lambda x: abs(x["value"]), reverse=True)
        return factors[:n]

    except Exception as e:
        # Return placeholder factors on failure
        return [{"feature": f, "value": 0.0} for f in feature_names[:n]]
