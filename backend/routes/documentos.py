from flask import Blueprint, request, jsonify, send_file
import os
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required
from app import db
from models.practica import Practica

documentos_bp = Blueprint('documentos', __name__)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}

# Crear subdirectorios para cada tipo de documento
DOCUMENT_TYPES = {
    'carta_supervisor': 'cartas_supervisor',
    'certificado_alumno': 'certificados_alumno',
    'formulario_inscripcion': 'formularios_inscripcion',
    'autorizacion_empresa': 'autorizaciones_empresa'
}

# Crear directorios si no existen
for doc_type in DOCUMENT_TYPES.values():
    path = os.path.join(UPLOAD_FOLDER, doc_type)
    if not os.path.exists(path):
        os.makedirs(path)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_document(file, practica_id, doc_type):
    if file and allowed_file(file.filename):
        filename = secure_filename(f"practica_{practica_id}_{file.filename}")
        subfolder = DOCUMENT_TYPES.get(doc_type)
        if not subfolder:
            return None
            
        filepath = os.path.join(UPLOAD_FOLDER, subfolder, filename)
        file.save(filepath)
        return filepath
    return None

@documentos_bp.route('/documentos/subir/<string:tipo>/<int:practica_id>', methods=['POST'])
@jwt_required()
def subir_documento(tipo, practica_id):
    try:
        if tipo not in DOCUMENT_TYPES:
            return jsonify({
                'error': 'Tipo de documento no válido',
                'status': 'error'
            }), 400

        if 'file' not in request.files:
            return jsonify({
                'error': 'No se ha enviado ningún archivo',
                'status': 'error'
            }), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'message': 'No se seleccionó ningún archivo',
                'status': 'success'
            }), 200

        practica = Practica.query.get_or_404(practica_id)
        
        # Si ya existe un archivo anterior, eliminarlo
        filepath_anterior = getattr(practica, tipo)
        if filepath_anterior and os.path.exists(filepath_anterior):
            os.remove(filepath_anterior)

        filepath = save_document(file, practica_id, tipo)
        
        if not filepath:
            return jsonify({
                'message': 'Tipo de archivo no permitido',
                'status': 'error'
            }), 400

        setattr(practica, tipo, filepath)
        db.session.commit()

        return jsonify({
            'message': 'Documento subido exitosamente',
            'filepath': filepath,
            'tipo': tipo,
            'practica_id': practica_id,
            'status': 'success'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@documentos_bp.route('/documentos/descargar/<string:tipo>/<int:practica_id>', methods=['GET'])
@jwt_required()
def descargar_documento(tipo, practica_id):
    try:
        if tipo not in DOCUMENT_TYPES:
            return jsonify({
                'error': 'Tipo de documento no válido',
                'status': 'error'
            }), 400

        practica = Practica.query.get_or_404(practica_id)
        filepath = getattr(practica, tipo)

        if not filepath or not os.path.exists(filepath):
            return jsonify({
                'error': 'Documento no encontrado',
                'status': 'error'
            }), 404

        # Agregar headers para permitir la visualización en el navegador
        response = send_file(
            filepath,
            mimetype='application/pdf',
            as_attachment=False,  # Permite visualización en el navegador
            download_name=os.path.basename(filepath)
        )
        
        # Agregar headers para el control de caché
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        
        return response

    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@documentos_bp.route('/documentos/<string:tipo>/<int:practica_id>', methods=['DELETE'])
@jwt_required()
def eliminar_documento(tipo, practica_id):
    try:
        if tipo not in DOCUMENT_TYPES:
            return jsonify({
                'error': 'Tipo de documento no válido',
                'status': 'error'
            }), 400

        practica = Practica.query.get_or_404(practica_id)
        filepath = getattr(practica, tipo)

        if filepath and os.path.exists(filepath):
            os.remove(filepath)
            setattr(practica, tipo, None)
            db.session.commit()

        return jsonify({
            'message': 'Documento eliminado exitosamente',
            'status': 'success'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500