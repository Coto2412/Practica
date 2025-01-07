from flask import Blueprint, jsonify
from models.estudiante import Estudiante

estudiantes_bp = Blueprint('estudiantes', __name__)

@estudiantes_bp.route('/estudiantes', methods=['GET'])
def obtener_estudiantes():
    try:
        estudiantes = Estudiante.query.all()
        return jsonify({
            'data': [estudiante.to_dict() for estudiante in estudiantes],
            'status': 'success'
        }), 200
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500